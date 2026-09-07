import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";

const URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

const admin = createClient(URL, SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const H = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const out = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), {
    status: s,
    headers: H
  });

const fail = (m: string, s = 400): never => {
  throw Object.assign(new Error(m), { status: s });
};

async function user(req: Request): Promise<User | null> {
  const h = req.headers.get("authorization") ?? "";

  if (!h.toLowerCase().startsWith("bearer ")) return null;

  const { data } = await admin.auth.getUser(h.slice(7).trim());

  return data.user ?? null;
}

async function reqUser(req: Request) {
  const u = await user(req);

  if (!u) fail("Authentication required", 401);

  return u;
}

function client(req: Request): SupabaseClient {
  const h = req.headers.get("authorization");

  if (!h) fail("Authentication required", 401);

  return createClient(URL, ANON, {
    global: {
      headers: {
        Authorization: h
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function str(
  v: unknown,
  max: number,
  name: string,
  required = false
) {
  if (v == null) {
    if (required) fail(`${name} is required`);
    return null;
  }

  const s = String(v).trim();

  if (required && !s) fail(`${name} is required`);

  if (s.length > max) fail(`${name} is too long`);

  return s || null;
}

function code() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const b = crypto.getRandomValues(new Uint8Array(10));

  return Array.from(b, x => a[x % a.length]).join("");
}

async function uniqueCode() {
  for (let i = 0; i < 12; i++) {
    const c = code();

    const { data, error } = await admin
      .from("tests")
      .select("id")
      .eq("share_code", c)
      .maybeSingle();

    if (error) throw error;

    if (!data) return c;
  }

  fail("Could not generate a unique share code", 503);
}

async function owned(uid: string, id: string) {
  const { data, error } = await admin
    .from("tests")
    .select(
      "id,owner_id,status,total_questions,attempt_count,completed_count"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  if (!data) fail("Test not found", 404);

  if (data.owner_id !== uid) fail("Forbidden", 403);

  return data;
}

async function limits(userId?: string) {
  const { data, error } = await admin
    .from("app_settings")
    .select("key,value")
    .in("key", [
      "tests.max_questions",
      "tests.max_options",
      "base_test_limit"
    ]);

  if (error) throw error;

  const m = new Map(
    (data ?? []).map((x: any) => [x.key, x.value])
  );

  const baseLimit = Number(m.get("base_test_limit") ?? 5);
  let earnedExtra = 0;
  let manualBonus = 0;

  // If userId provided, get their referral rewards and manual bonus
  if (userId) {
    const { data: rewards } = await admin
      .from("referral_rewards")
      .select("earned_extra_tests, manual_bonus_tests")
      .eq("user_id", userId)
      .maybeSingle();

    earnedExtra = rewards?.earned_extra_tests || 0;
    manualBonus = rewards?.manual_bonus_tests || 0;
  }

  return {
    q: Number(m.get("tests.max_questions") ?? 50),
    o: Number(m.get("tests.max_options") ?? 8),
    test_limit: baseLimit + earnedExtra + manualBonus,
    base_limit: baseLimit,
    earned_extra: earnedExtra,
    manual_bonus: manualBonus
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: H
    });
  }

  if (req.method !== "POST") {
    return out(
      {
        error: "POST required"
      },
      405
    );
  }

  try {
    const b = await req.json();
    const a = String(b?.action ?? "");

    switch (a) {

      case "create_test": {
        const u = await reqUser(req);

        // Check test limit including referral rewards
        const lim = await limits(u.id);

        // Count user's existing tests (excluding deleted)
        const { count: testCount } = await admin
          .from("tests")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", u.id)
          .neq("status", "deleted");

        if ((testCount || 0) >= lim.test_limit) {
          fail(
            `Test limit reached. You have created ${testCount} of ${lim.test_limit} tests (base: ${lim.base_limit}, earned: ${lim.earned_extra}).`,
            403
          );
        }

        const { data, error } = await client(req)
          .from("tests")
          .insert({
            owner_id: u.id,
            title: str(
              b.title,
              160,
              "title",
              true
            ),
            description: str(
              b.description,
              2000,
              "description"
            ),
            theme: b.theme ?? {},
            status: "draft",
            share_code: null
          })
          .select("*")
          .single();

        if (error) throw error;

        return out({
          test: data
        });
      }

      case "create_question": {
        const u = await reqUser(req);
        const tid = String(b.test_id ?? "");

        if (!tid) {
          fail("test_id is required");
        }

        const t = await owned(u.id, tid);

        if (t.status !== "draft") {
          fail(
            "Questions can only be edited while the test is a draft"
          );
        }

        const q = b.question ?? {};
        const questionType = q.question_type ?? q.questionType;

        if (
          questionType !== "essay" &&
          questionType !== "multiple_choice"
        ) {
          fail("Invalid question type");
        }

        console.log("[quiz-api] create_question question_type =", questionType);

        const prompt = str(
          q.prompt,
          2000,
          "question.prompt",
          true
        );

        const pts =
          Number.isInteger(q.points) &&
          q.points > 0 &&
          q.points <= 100
            ? q.points
            : 1;

        const lim = await limits();

        if ((t.total_questions ?? 0) >= lim.q) {
          fail(
            `Maximum ${lim.q} questions allowed`
          );
        }

        const opts = Array.isArray(q.options)
          ? q.options
          : [];

        if (questionType === "multiple_choice") {

          if (
            opts.length < 2 ||
            opts.length > lim.o
          ) {
            fail(
              `Multiple choice questions need 2-${lim.o} options`
            );
          }

          if (
            opts.filter(
              (x: any) => x?.is_correct === true
            ).length !== 1
          ) {
            fail(
              "Exactly one correct option is required"
            );
          }

        } else if (opts.length) {
          fail(
            "Essay questions cannot have options"
          );
        }

        const { data: question, error } =
          await client(req)
            .from("test_questions")
            .insert({
              test_id: tid,
              question_type: questionType,
              prompt,
              position:
                Number.isInteger(q.position) &&
                q.position >= 0
                  ? q.position
                  : (t.total_questions ?? 0),
              required: q.required !== false,
              points: pts
            })
            .select("*")
            .single();

        if (error) throw error;

        if (questionType === "multiple_choice") {

          const ins: any[] = [];

          for (let i = 0; i < opts.length; i++) {

            const {
              data: o,
              error: oe
            } = await admin
              .from("question_options")
              .insert({
                question_id: question.id,
                option_text: str(
                  opts[i]?.option_text,
                  500,
                  `option ${i + 1}`,
                  true
                ),
                position: i + 1
              })
              .select("id")
              .single();

            if (oe) throw oe;

            ins.push(o);
          }

          const ci = opts.findIndex(
            (x: any) => x?.is_correct === true
          );

          const { error: ke } = await admin
            .from("question_answer_keys")
            .insert({
              question_id: question.id,
              correct_option_id: ins[ci].id
            });

          if (ke) throw ke;
        }

        return out({
          success: true,
          question_id: question.id,
          question
        });
      }

      case "publish_test": {
        const u = await reqUser(req);
        const tid = String(b.test_id ?? "");

        if (!tid) {
          fail("test_id is required");
        }

        const t = await owned(u.id, tid);

        if (t.status !== "draft") {
          fail(
            "Test must be in draft status to publish"
          );
        }

        if (!t.total_questions) {
          fail(
            "Test must have at least one question"
          );
        }

        const {
          data: qs,
          error: qe
        } = await admin
          .from("test_questions")
          .select("id,question_type")
          .eq("test_id", tid)
          .order("position");

        if (qe) throw qe;

        const lim = await limits();

        if (
          !qs?.length ||
          qs.length > lim.q
        ) {
          fail("Invalid question count");
        }

        for (const q of qs) {

          if (
            q.question_type !==
            "multiple_choice"
          ) {
            continue;
          }

          const {
            data: os,
            error: oe
          } = await admin
            .from("question_options")
            .select("id")
            .eq("question_id", q.id);

          if (oe) throw oe;

          if (
            !os ||
            os.length < 2 ||
            os.length > lim.o
          ) {
            fail(
              "Invalid multiple choice options"
            );
          }

          const {
            data: k,
            error: ke
          } = await admin
            .from("question_answer_keys")
            .select("correct_option_id")
            .eq("question_id", q.id)
            .maybeSingle();

          if (ke) throw ke;

          if (!k) {
            fail(
              "Every multiple choice question must have a correct answer"
            );
          }
        }

        const c = await uniqueCode();

        const {
          data,
          error
        } = await admin
          .from("tests")
          .update({
            status: "active",
            share_code: c,
            published_at:
              new Date().toISOString()
          })
          .eq("id", tid)
          .eq("owner_id", u.id)
          .eq("status", "draft")
          .select("*")
          .single();

        if (error) throw error;

        return out({
          test: data,
          share_code: c
        });
      }

      case "get_tests": {
        const u = await reqUser(req);

        const {
          data,
          error
        } = await client(req)
          .from("tests")
          .select(
            "id,title,description,status,share_code,total_questions,attempt_count,completed_count,created_at,updated_at,published_at"
          )
          .eq("owner_id", u.id)
          .neq("status", "deleted")
          .order("created_at", {
            ascending: false
          });

        if (error) throw error;

        return out({
          tests: data ?? []
        });
      }

      case "delete_test": {
        const u = await reqUser(req);
        const tid = String(b.test_id ?? "");

        if (!tid) {
          fail("test_id is required");
        }

        // Verify ownership
        const { data: test, error: testError } = await client(req)
          .from("tests")
          .select("id,owner_id")
          .eq("id", tid)
          .single();

        if (testError || !test) {
          fail("Test not found");
        }

        if (test.owner_id !== u.id) {
          fail("You can only delete your own tests");
        }

        // Soft delete
        const { error: updateError } = await client(req)
          .from("tests")
          .update({
            status: "deleted",
            deleted_at: new Date().toISOString()
          })
          .eq("id", tid)
          .eq("owner_id", u.id);

        if (updateError) throw updateError;

        return out({ success: true, test_id: tid });
      }

      case "get_dashboard_stats": {
        const u = await reqUser(req);
        const c = client(req);

        const {
          data: ts,
          error: te
        } = await c
          .from("tests")
          .select(
            "id,attempt_count,completed_count"
          )
          .eq("owner_id", u.id);

        if (te) throw te;

        const ids = (ts ?? []).map(
          (x: any) => x.id
        );

        if (!ids.length) {
          return out({
            total_tests: 0,
            total_participants: 0,
            total_completed: 0,
            total_answers: 0,
            average_percentage: 0
          });
        }

        const {
          data: as,
          error: ae
        } = await c
          .from("test_attempts")
          .select(
            "id,percentage,status"
          )
          .in("test_id", ids)
          .eq("status", "submitted");

        if (ae) throw ae;

        const done = as ?? [];

        const avg = done.length
          ? Math.round(
              done.reduce(
                (s: number, x: any) =>
                  s + Number(x.percentage ?? 0),
                0
              ) / done.length
            )
          : 0;

        return out({
          total_tests: ts?.length ?? 0,

          total_participants:
            (ts ?? []).reduce(
              (s: number, x: any) =>
                s +
                Number(
                  x.attempt_count ?? 0
                ),
              0
            ),

          total_completed:
            (ts ?? []).reduce(
              (s: number, x: any) =>
                s +
                Number(
                  x.completed_count ?? 0
                ),
              0
            ),

          total_answers: done.length,

          average_percentage: avg
        });
      }

      case "analytics":
      case "get_test_analytics": {
        const u = await reqUser(req);
        const tid = String(
          b.test_id ?? ""
        );

        if (!tid) {
          fail("test_id is required");
        }

        await owned(u.id, tid);

        const {
          data,
          error
        } = await admin
          .from("test_attempts")
          .select(
            "id,status,percentage,score,max_score,submitted_at"
          )
          .eq("test_id", tid);

        if (error) throw error;

        const d = (data ?? []).filter(
          (x: any) =>
            x.status === "submitted"
        );

        const p = d.map(
          (x: any) =>
            Number(x.percentage ?? 0)
        );

        return out({
          attempts: data?.length ?? 0,
          completed: d.length,

          average_percentage: p.length
            ? Number(
                (
                  p.reduce(
                    (x, y) => x + y,
                    0
                  ) / p.length
                ).toFixed(2)
              )
            : 0,

          highest_percentage: p.length
            ? Math.max(...p)
            : null,

          lowest_percentage: p.length
            ? Math.min(...p)
            : null
        });
      }

      case "get_quiz_by_share_code": {
        const c = str(
          b.share_code,
          32,
          "share_code",
          true
        );

        const {
          data: t,
          error: te
        } = await admin
          .from("tests")
          .select(
            "id,title,description,status,theme,cover_image_url,show_score_to_participant,show_rank_to_participant,allow_anonymous,allow_result_sharing,allow_create_own_test_prompt"
          )
          .eq("share_code", c)
          .eq("status", "active")
          .is("deleted_at", null)
          .maybeSingle();

        if (te) throw te;

        if (!t) {
          fail("Test not found", 404);
        }

        const {
          data: qs,
          error: qe
        } = await admin
          .from("test_questions")
          .select(
            "id,question_type,prompt,position,required,points"
          )
          .eq("test_id", t.id)
          .order("position");

        if (qe) throw qe;

        const ids = (qs ?? []).map(
          (x: any) => x.id
        );

        let os: any[] = [];

        if (ids.length) {
          const {
            data,
            error
          } = await admin
            .from("question_options")
            .select(
              "id,question_id,option_text,position"
            )
            .in("question_id", ids)
            .order("position");

          if (error) throw error;

          os = data ?? [];
        }

        return out({
          test: t,
          questions: qs ?? [],
          options: os
        });
      }

      case "start":
      case "start_attempt": {
        const c = str(
          b.share_code,
          32,
          "share_code",
          true
        );

        const u = await user(req);

        const {
          data,
          error
        } = await admin.rpc(
          "start_attempt_by_share_code",
          {
            p_share_code: c,
            p_participant_name:
              str(
                b.participant_name,
                80,
                "participant_name"
              ),
            p_participant_user_id:
              u?.id ?? null
          }
        );

        if (error) throw error;

        return out(data);
      }

      case "answer":
      case "save_answer": {
        const id = String(
          b.attempt_id ?? ""
        );

        const qid = String(
          b.question_id ?? ""
        );

        const token =
          b.participant_token;

        if (
          !id ||
          !qid ||
          !token
        ) {
          fail(
            "attempt_id, participant_token and question_id are required"
          );
        }

        const x = b.answer ?? {};

        const {
          data,
          error
        } = await admin.rpc(
          "save_attempt_answer",
          {
            p_attempt_id: id,
            p_participant_token:
              token,
            p_question_id: qid,

            p_selected_option_id:
              x.selected_option_id ??
              b.selected_option_id ??
              null,

            p_answer_text:
              x.answer_text ??
              b.answer_text ??
              null
          }
        );

        if (error) throw error;

        return out(data);
      }

      case "submit": {
        const id = String(
          b.attempt_id ?? ""
        );

        const token =
          b.participant_token;

        if (!id || !token) {
          fail(
            "attempt_id and participant_token are required"
          );
        }

        const {
          data,
          error
        } = await admin.rpc(
          "submit_attempt_secure",
          {
            p_attempt_id: id,
            p_participant_token:
              token
          }
        );

        if (error) throw error;

        return out(data);
      }

      case "result": {
        const id = String(
          b.attempt_id ?? ""
        );

        const token =
          b.participant_token;

        if (!id || !token) {
          fail(
            "attempt_id and participant_token are required"
          );
        }

        const {
          data,
          error
        } = await admin.rpc(
          "get_attempt_result",
          {
            p_attempt_id: id,
            p_participant_token:
              token
          }
        );

        if (error) throw error;

        return out(data);
      }

      case "track_referral_visit": {
        const referralCode = str(b.referral_code, 32, "referral_code", true);
        const visitorIdentifier = str(b.visitor_identifier, 255, "visitor_identifier", true);

        // Find referrer by code
        const { data: referrer, error: referrerError } = await admin
          .from("profiles")
          .select("id")
          .eq("referral_code", referralCode)
          .single();

        if (referrerError || !referrer) {
          // Invalid referral code, but don't fail - just return silently
          return out({ tracked: false, reason: "invalid_code" });
        }

        // Check if this visitor already visited this referrer
        const { data: existingVisit } = await admin
          .from("referral_visits")
          .select("*")
          .eq("referrer_id", referrer.id)
          .eq("visitor_identifier", visitorIdentifier)
          .maybeSingle();

        if (existingVisit) {
          // Update last visit time and increment count
          const { error: updateError } = await admin
            .from("referral_visits")
            .update({
              last_visit_at: new Date().toISOString(),
              visit_count: existingVisit.visit_count + 1
            })
            .eq("id", existingVisit.id);

          if (updateError) throw updateError;

          return out({ tracked: true, is_new: false, visit_id: existingVisit.id });
        }

        // Create new referral visit
        const { data: newVisit, error: insertError } = await admin
          .from("referral_visits")
          .insert({
            referrer_id: referrer.id,
            visitor_identifier: visitorIdentifier,
            first_visit_at: new Date().toISOString(),
            last_visit_at: new Date().toISOString(),
            visit_count: 1
          })
          .select()
          .single();

        if (insertError) throw insertError;

        return out({ tracked: true, is_new: true, visit_id: newVisit.id });
      }

      case "convert_referral": {
        const visitorIdentifier = str(b.visitor_identifier, 255, "visitor_identifier", true);
        const userId = str(b.user_id, 36, "user_id", true);

        // Prevent self-referral
        const { data: visit } = await admin
          .from("referral_visits")
          .select("referrer_id")
          .eq("visitor_identifier", visitorIdentifier)
          .is("converted_user_id", null)
          .maybeSingle();

        if (!visit) {
          return out({ converted: false, reason: "no_pending_visit" });
        }

        if (visit.referrer_id === userId) {
          return out({ converted: false, reason: "self_referral" });
        }

        // Check if user already has a referrer (prevent changing referral)
        const { data: userProfile } = await admin
          .from("profiles")
          .select("referred_by")
          .eq("id", userId)
          .single();

        if (userProfile?.referred_by) {
          return out({ converted: false, reason: "already_referred" });
        }

        // Update the visit with converted user
        const { error: updateError } = await admin
          .from("referral_visits")
          .update({
            converted_user_id: userId,
            converted_at: new Date().toISOString(),
            is_qualified: true,
            qualified_at: new Date().toISOString()
          })
          .eq("visitor_identifier", visitorIdentifier)
          .is("converted_user_id", null);

        if (updateError) throw updateError;

        // Update user's referred_by (only if not already set)
        const { error: profileUpdateError } = await admin
          .from("profiles")
          .update({ referred_by: visit.referrer_id })
          .eq("id", userId)
          .is("referred_by", null);

        if (profileUpdateError) throw profileUpdateError;

        return out({ converted: true, referrer_id: visit.referrer_id });
      }

      case "get_referral_code": {
        const u = await reqUser(req);

        const { data: profile, error } = await admin
          .from("profiles")
          .select("referral_code")
          .eq("id", u.id)
          .single();

        if (error) throw error;

        return out({ referral_code: profile?.referral_code });
      }

      case "admin_get_stats": {
        const u = await reqUser(req);

        // Verify admin role
        const { data: profile } = await admin
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();

        if (!profile || profile.role !== "admin") {
          fail("Admin access required", 403);
        }

        // Get total users
        const { count: totalUsers } = await admin
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Get active users
        const { count: activeUsers } = await admin
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        // Get admin count
        const { count: adminCount } = await admin
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "admin");

        // Get total tests (excluding deleted)
        const { count: totalTests } = await admin
          .from("tests")
          .select("*", { count: "exact", head: true })
          .neq("status", "deleted");

        // Get active tests
        const { count: activeTests } = await admin
          .from("tests")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        // Get total attempts
        const { count: totalAttempts } = await admin
          .from("test_attempts")
          .select("*", { count: "exact", head: true });

        // Get completed attempts
        const { count: completedAttempts } = await admin
          .from("test_attempts")
          .select("*", { count: "exact", head: true })
          .eq("status", "submitted");

        // Get total referral visitors
        const { count: totalReferralVisitors } = await admin
          .from("referral_visits")
          .select("*", { count: "exact", head: true });

        // Get total qualified referrals
        const { count: totalQualifiedReferrals } = await admin
          .from("referral_visits")
          .select("*", { count: "exact", head: true })
          .eq("is_qualified", true);

        // Get total referral bonus tests
        const { data: referralBonuses } = await admin
          .from("referral_rewards")
          .select("earned_extra_tests");

        const totalReferralBonusTests = referralBonuses?.reduce((sum: number, r: any) => sum + (r.earned_extra_tests || 0), 0) || 0;

        // Get total manual bonus tests
        const { data: manualBonuses } = await admin
          .from("referral_rewards")
          .select("manual_bonus_tests");
        const totalManualBonusTests = manualBonuses?.reduce((sum: number, r: any) => sum + (r.manual_bonus_tests || 0), 0) || 0;

        return out({
          total_users: totalUsers || 0,
          active_users: activeUsers || 0,
          admin_count: adminCount || 0,
          total_tests: totalTests || 0,
          active_tests: activeTests || 0,
          total_attempts: totalAttempts || 0,
          completed_attempts: completedAttempts || 0,
          total_referral_visitors: totalReferralVisitors || 0,
          total_qualified_referrals: totalQualifiedReferrals || 0,
          total_referral_bonus_tests: totalReferralBonusTests,
          total_manual_bonus_tests: totalManualBonusTests
        });
      }

      case "admin_get_users": {
        const u = await reqUser(req);

        // Verify admin role
        const { data: profile } = await admin
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();

        if (!profile || profile.role !== "admin") {
          fail("Admin access required", 403);
        }

        const search = b.search ? String(b.search) : "";
        const sortBy = b.sort_by ? String(b.sort_by) : "created_at";
        const sortOrder = b.sort_order === "asc" ? "asc" : "desc";
        const limit = Number(b.limit) || 50;
        const offset = Number(b.offset) || 0;

        // Build query
        let query = admin
          .from("profiles")
          .select(`
            id,
            username,
            display_name,
            created_at,
            is_active,
            referral_code,
            referred_by,
            referral_rewards (
              qualified_referrals_count,
              earned_extra_tests,
              manual_bonus_tests,
              used_extra_tests
            )
          `, { count: "exact" });

        // Add search filter
        if (search) {
          query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
        }

        // Add sorting
        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        // Add pagination
        query = query.range(offset, offset + limit - 1);

        const { data: users, error, count } = await query;

        if (error) throw error;

        // Get additional stats for each user
        const usersWithStats = await Promise.all(
          (users || []).map(async (user: any) => {
            // Get email from auth.users
            const { data: authUser } = await admin.auth.admin.getUserById(user.id);
            const email = authUser.user?.email || null;

            // Count tests (excluding deleted)
            const { count: testCount } = await admin
              .from("tests")
              .select("*", { count: "exact", head: true })
              .eq("owner_id", user.id)
              .neq("status", "deleted");

            // Count published tests
            const { count: publishedCount } = await admin
              .from("tests")
              .select("*", { count: "exact", head: true })
              .eq("owner_id", user.id)
              .eq("status", "active");

            // Count total participants in user's tests
            const { count: participantCount } = await admin
              .from("test_attempts")
              .select("*", { count: "exact", head: true })
              .in(
                "test_id",
                admin
                  .from("tests")
                  .select("id")
                  .eq("owner_id", user.id)
                  .neq("status", "deleted")
              );

            // Count completed participants
            const { count: completedCount } = await admin
              .from("test_attempts")
              .select("*", { count: "exact", head: true })
              .eq("status", "submitted")
              .in(
                "test_id",
                admin
                  .from("tests")
                  .select("id")
                  .eq("owner_id", user.id)
                  .neq("status", "deleted")
              );

            // Count total referral visits
            const { count: referralVisits } = await admin
              .from("referral_visits")
              .select("*", { count: "exact", head: true })
              .eq("referrer_id", user.id);

            const rewards = user.referral_rewards?.[0] || {
              qualified_referrals_count: 0,
              earned_extra_tests: 0,
              manual_bonus_tests: 0,
              used_extra_tests: 0
            };

            // Get base test limit from app_settings
            const { data: baseLimitSetting } = await admin
              .from("app_settings")
              .select("value")
              .eq("key", "base_test_limit")
              .maybeSingle();
            
            const baseLimit = Number(baseLimitSetting?.value || 5);
            const totalLimit = baseLimit + (rewards.earned_extra_tests || 0) + (rewards.manual_bonus_tests || 0);
            const remainingTests = Math.max(totalLimit - (testCount || 0), 0);

            return {
              ...user,
              email,
              test_count: testCount || 0,
              published_count: publishedCount || 0,
              participant_count: participantCount || 0,
              completed_count: completedCount || 0,
              referral_visits: referralVisits || 0,
              qualified_referrals: rewards.qualified_referrals_count || 0,
              earned_extra_tests: rewards.earned_extra_tests || 0,
              manual_bonus_tests: rewards.manual_bonus_tests || 0,
              used_extra_tests: rewards.used_extra_tests || 0,
              base_limit: baseLimit,
              total_limit: totalLimit,
              remaining_extra_tests: remainingTests
            };
          })
        );

        return out({
          users: usersWithStats,
          total: count || 0,
          limit,
          offset
        });
      }

      case "admin_get_user_details": {
        const u = await reqUser(req);

        // Verify admin role
        const { data: profile } = await admin
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();

        if (!profile || profile.role !== "admin") {
          fail("Admin access required", 403);
        }

        const targetUserId = str(b.user_id, 36, "user_id", true);

        // Get user profile
        const { data: user, error: userError } = await admin
          .from("profiles")
          .select(`
            *,
            referral_rewards (
              qualified_referrals_count,
              earned_extra_tests,
              manual_bonus_tests,
              used_extra_tests,
              last_calculated_at
            )
          `)
          .eq("id", targetUserId)
          .single();

        if (userError || !user) {
          fail("User not found", 404);
        }

        // Get email from auth.users
        const { data: authUser } = await admin.auth.admin.getUserById(targetUserId);
        const email = authUser.user?.email || null;

        // Get user's tests
        const { data: tests } = await admin
          .from("tests")
          .select(`
            id,
            title,
            status,
            created_at,
            total_questions,
            attempt_count,
            completed_count
          `)
          .eq("owner_id", targetUserId)
          .neq("status", "deleted")
          .order("created_at", { ascending: false });

        // Get referral visits
        const { data: referralVisits } = await admin
          .from("referral_visits")
          .select(`
            *,
            profiles:converted_user_id (
              username,
              display_name
            )
          `)
          .eq("referrer_id", targetUserId)
          .order("first_visit_at", { ascending: false });

        // Get test statistics for each test
        const testsWithStats = await Promise.all(
          (tests || []).map(async (test: any) => {
            const { count: participants } = await admin
              .from("test_attempts")
              .select("*", { count: "exact", head: true })
              .eq("test_id", test.id);

            const { count: completed } = await admin
              .from("test_attempts")
              .select("*", { count: "exact", head: true })
              .eq("test_id", test.id)
              .eq("status", "submitted");

            // Get average, highest, lowest scores
            const { data: scores } = await admin
              .from("test_attempts")
              .select("percentage")
              .eq("test_id", test.id)
              .eq("status", "submitted");

            const validScores = scores?.map((s: any) => s.percentage).filter((p: number) => p !== null) || [];
            const avgScore = validScores.length > 0 
              ? Math.round(validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length)
              : 0;
            const maxScore = validScores.length > 0 ? Math.max(...validScores) : 0;
            const minScore = validScores.length > 0 ? Math.min(...validScores) : 0;

            return {
              ...test,
              participants: participants || 0,
              completed: completed || 0,
              average_score: avgScore,
              highest_score: maxScore,
              lowest_score: minScore
            };
          })
        );

        // Get attempt breakdown for user's tests
        const { count: totalAttempts } = await admin
          .from("test_attempts")
          .select("*", { count: "exact", head: true })
          .in(
            "test_id",
            admin
              .from("tests")
              .select("id")
              .eq("owner_id", targetUserId)
              .neq("status", "deleted")
          );

        const { count: submittedAttempts } = await admin
          .from("test_attempts")
          .select("*", { count: "exact", head: true })
          .eq("status", "submitted")
          .in(
            "test_id",
            admin
              .from("tests")
              .select("id")
              .eq("owner_id", targetUserId)
              .neq("status", "deleted")
          );

        const { count: inProgressAttempts } = await admin
          .from("test_attempts")
          .select("*", { count: "exact", head: true })
          .eq("status", "in_progress")
          .in(
            "test_id",
            admin
              .from("tests")
              .select("id")
              .eq("owner_id", targetUserId)
              .neq("status", "deleted")
          );

        const { count: abandonedAttempts } = await admin
          .from("test_attempts")
          .select("*", { count: "exact", head: true })
          .eq("status", "abandoned")
          .in(
            "test_id",
            admin
              .from("tests")
              .select("id")
              .eq("owner_id", targetUserId)
              .neq("status", "deleted")
          );

        const rewards = user.referral_rewards?.[0] || {
          qualified_referrals_count: 0,
          earned_extra_tests: 0,
          manual_bonus_tests: 0,
          used_extra_tests: 0,
          last_calculated_at: null
        };

        // Get base test limit from app_settings
        const { data: baseLimitSetting } = await admin
          .from("app_settings")
          .select("value")
          .eq("key", "base_test_limit")
          .maybeSingle();
        
        const baseLimit = Number(baseLimitSetting?.value || 5);
        const totalLimit = baseLimit + (rewards.earned_extra_tests || 0) + (rewards.manual_bonus_tests || 0);
        const remainingTests = Math.max(totalLimit - ((tests || []).length || 0), 0);

        return out({
          user: {
            ...user,
            email
          },
          rewards,
          stats: {
            test_count: (tests || []).length,
            participants: totalAttempts || 0,
            submitted_attempts: submittedAttempts || 0,
            in_progress_attempts: inProgressAttempts || 0,
            abandoned_attempts: abandonedAttempts || 0,
            referral_visitors: referralVisits?.length || 0,
            qualified_referrals: rewards.qualified_referrals_count || 0
          },
          test_stats: {
            test_count: (tests || []).length,
            participant_count: totalAttempts || 0,
            base_limit: baseLimit,
            total_limit: totalLimit,
            remaining_extra_tests: remainingTests,
            base_attempts: Math.min((tests || []).length, baseLimit)
          },
          tests: testsWithStats,
          referral_visits: referralVisits || []
        });
      }

      case "admin_get_reward_settings": {
        const u = await reqUser(req);

        // Verify admin role
        const { data: profile } = await admin
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();

        if (!profile || profile.role !== "admin") {
          fail("Admin access required", 403);
        }

        // Get reward settings
        const { data: settings } = await admin
          .from("app_settings")
          .select("key,value")
          .in("key", ["referral_reward_milestones", "base_test_limit"]);

        const settingsMap = new Map(
          (settings || []).map((s: any) => [s.key, s.value])
        );

        const milestonesJson = settingsMap.get("referral_reward_milestones") || "[]";
        const milestones = JSON.parse(milestonesJson as string);
        const baseLimit = Number(settingsMap.get("base_test_limit") || "5");

        return out({
          milestones,
          base_test_limit: baseLimit
        });
      }

      case "admin_update_reward_settings": {
        const u = await reqUser(req);

        // Verify admin role
        const { data: profile } = await admin
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();

        if (!profile || profile.role !== "admin") {
          fail("Admin access required", 403);
        }

        const milestones = b.milestones;
        const baseLimit = Number(b.base_test_limit);

        if (!Array.isArray(milestones)) {
          fail("milestones must be an array");
        }

        if (typeof baseLimit !== "number" || baseLimit < 0) {
          fail("base_test_limit must be a non-negative number");
        }

        // Validate milestones
        for (const m of milestones) {
          if (typeof m.referrals !== "number" || m.referrals < 0) {
            fail("Each milestone must have a valid referrals number");
          }
          if (typeof m.extra_tests !== "number" || m.extra_tests < 0) {
            fail("Each milestone must have a valid extra_tests number");
          }
        }

        // Update settings
        const { error: milestoneError } = await admin
          .from("app_settings")
          .upsert({
            key: "referral_reward_milestones",
            value: JSON.stringify(milestones)
          }, { onConflict: "key" });

        if (milestoneError) throw milestoneError;

        const { error: limitError } = await admin
          .from("app_settings")
          .upsert({
            key: "base_test_limit",
            value: String(baseLimit)
          }, { onConflict: "key" });

        if (limitError) throw limitError;

        // Recalculate all referral rewards
        const { data: allRewards } = await admin
          .from("referral_rewards")
          .select("user_id");

        for (const reward of allRewards || []) {
          await admin.rpc("calculate_referral_rewards", { user_id: reward.user_id });
        }

        return out({ success: true });
      }

      case "admin_add_manual_bonus": {
        const u = await reqUser(req);

        // Verify admin role
        const { data: profile } = await admin
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();

        if (!profile || profile.role !== "admin") {
          fail("Admin access required", 403);
        }

        const targetUserId = str(b.user_id, 36, "user_id", true);
        const bonusAmount = Number(b.bonus_amount);

        if (typeof bonusAmount !== "number" || bonusAmount < 0) {
          fail("bonus_amount must be a non-negative number");
        }

        // Get current rewards
        const { data: currentRewards } = await admin
          .from("referral_rewards")
          .select("*")
          .eq("user_id", targetUserId)
          .maybeSingle();

        const currentBonus = currentRewards?.manual_bonus_tests || 0;
        const newBonus = currentBonus + bonusAmount;

        // Update or insert manual bonus
        const { error } = await admin
          .from("referral_rewards")
          .upsert({
            user_id: targetUserId,
            manual_bonus_tests: newBonus,
            last_calculated_at: new Date().toISOString()
          }, {
            onConflict: "user_id",
            ignoreDuplicates: false
          });

        if (error) throw error;

        // Get updated rewards
        const { data: updatedRewards } = await admin
          .from("referral_rewards")
          .select("*")
          .eq("user_id", targetUserId)
          .single();

        return out({ rewards: updatedRewards });
      }

      case "admin_remove_manual_bonus": {
        const u = await reqUser(req);

        // Verify admin role
        const { data: profile } = await admin
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();

        if (!profile || profile.role !== "admin") {
          fail("Admin access required", 403);
        }

        const targetUserId = str(b.user_id, 36, "user_id", true);
        const bonusAmount = Number(b.bonus_amount);

        if (typeof bonusAmount !== "number" || bonusAmount < 0) {
          fail("bonus_amount must be a non-negative number");
        }

        // Get current rewards
        const { data: currentRewards } = await admin
          .from("referral_rewards")
          .select("*")
          .eq("user_id", targetUserId)
          .maybeSingle();

        if (!currentRewards) {
          return out({ rewards: null });
        }

        const currentBonus = currentRewards.manual_bonus_tests || 0;
        const newBonus = Math.max(0, currentBonus - bonusAmount);

        // Update manual bonus (subtract)
        const { error } = await admin
          .from("referral_rewards")
          .update({
            manual_bonus_tests: newBonus,
            last_calculated_at: new Date().toISOString()
          })
          .eq("user_id", targetUserId);

        if (error) throw error;

        // Get updated rewards
        const { data: updatedRewards } = await admin
          .from("referral_rewards")
          .select("*")
          .eq("user_id", targetUserId)
          .maybeSingle();

        return out({ rewards: updatedRewards });
      }

      case "admin_update_user": {
        const u = await reqUser(req);

        // Verify admin role
        const { data: profile } = await admin
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();

        if (!profile || profile.role !== "admin") {
          fail("Admin access required", 403);
        }

        const targetUserId = str(b.user_id, 36, "user_id", true);
        const displayName = str(b.display_name, 100, "display_name", false);
        const username = str(b.username, 50, "username", false);

        // Validate username uniqueness if provided
        if (username) {
          const { data: existingUser } = await admin
            .from("profiles")
            .select("id")
            .eq("username", username)
            .neq("id", targetUserId)
            .maybeSingle();

          if (existingUser) {
            fail("Username already taken", 409);
          }
        }

        // Build update object with only provided fields
        const updateData: any = {};
        if (displayName !== undefined) updateData.display_name = displayName;
        if (username !== undefined) updateData.username = username;

        // Update user profile
        const { error: updateError } = await admin
          .from("profiles")
          .update(updateData)
          .eq("id", targetUserId);

        if (updateError) throw updateError;

        // Get updated user
        const { data: updatedUser } = await admin
          .from("profiles")
          .select("*")
          .eq("id", targetUserId)
          .single();

        return out({ user: updatedUser });
      }

      case "admin_delete_user": {
        const u = await reqUser(req);

        // Verify admin role
        const { data: profile } = await admin
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();

        if (!profile || profile.role !== "admin") {
          fail("Admin access required", 403);
        }

        const uid = String(b.user_id ?? b.userId ?? "").trim();

        if (!uid) {
          fail("user_id is required");
        }

        const { data, error } = await admin
          .schema("private")
          .rpc("admin_delete_user", {
            p_admin_user_id: u.id,
            p_user_id: uid,
          });

        if (error) throw error;

        return out(data);
      }

      case "admin_delete_test": {
        const u = await reqUser(req);

        // Verify admin role
        const { data: profile } = await admin
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();

        if (!profile || profile.role !== "admin") {
          fail("Admin access required", 403);
        }

        const testId = str(b.test_id, 36, "test_id", true);

        // Soft delete the test
        const { error: deleteError } = await admin
          .from("tests")
          .update({
            status: "deleted",
            deleted_at: new Date().toISOString()
          })
          .eq("id", testId);

        if (deleteError) throw deleteError;

        return out({ success: true, test_id: testId });
      }

      default:
        fail(
          `Unknown action: ${
            a || "(empty)"
          }`
        );
    }

  } catch (e: any) {
    console.error(e);

    return out(
      {
        error:
          e?.message ||
          "Internal server error"
      },
      Number(e?.status) ||
        (e?.code === "42501"
          ? 403
          : 400)
    );
  }
});