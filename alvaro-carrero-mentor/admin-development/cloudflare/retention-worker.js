const RAW_RETENTION_MS=90*24*60*60*1000;
export async function cleanFeedback(env,now=Date.now()){
 if(!env.DB)throw Error('Missing DB binding');
 const raw=await env.DB.prepare('DELETE FROM feedback WHERE created_at <= ?').bind(now-RAW_RETENTION_MS).run();
 if(!raw.success||!Number.isInteger(raw.meta?.changes))throw Error('Feedback cleanup not confirmed');
 const limits=await env.DB.prepare('DELETE FROM feedback_rate_limits WHERE expires_at < ?').bind(now).run();
 if(!limits.success||!Number.isInteger(limits.meta?.changes))throw Error('Counter cleanup not confirmed');
 const audit=await env.DB.prepare('INSERT INTO retention_runs (ran_at, feedback_deleted, counters_deleted) VALUES (?, ?, ?)').bind(now,raw.meta.changes,limits.meta.changes).run();
 if(!audit.success)throw Error('Audit write failed');
 // Reviewed learning_notes are deliberately not touched. Never auto-copy raw text there.
 return {feedbackDeleted:raw.meta.changes,countersDeleted:limits.meta.changes};
}
export default {
 async scheduled(_event,env){await cleanFeedback(env)},
 async fetch(){return new Response('Not found',{status:404})}
};
