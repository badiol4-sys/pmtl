# Deployment Checklist - Tony Lainé App

Use this before going to production.

## Pre-Deployment (This Week)

### Code Quality
- [ ] Run TypeScript check: `npm run build`
- [ ] Zero TypeScript errors
- [ ] All imports resolved
- [ ] No console.log() in production code
- [ ] No hardcoded secrets (use env vars)

### Security
- [ ] Change JWT_SECRET (currently hardcoded)
- [ ] Change password hashing (SHA256 → bcrypt)
- [ ] Add input validation on all endpoints
- [ ] Implement rate limiting
- [ ] CORS restricted to known domains
- [ ] Remove debug endpoints

### Testing
- [ ] Test Animator login
- [ ] Test Teacher login (3 steps)
- [ ] Test Parent login
- [ ] Test PDF upload + extraction
- [ ] Test file uploads (images, documents)
- [ ] Test messaging (text messages)
- [ ] Test child data access (parent can only see own)
- [ ] Test broken links / 404s

### Database
- [ ] Schema loaded to D1
- [ ] All tables created
- [ ] Indexes verified
- [ ] Test user accounts created
- [ ] Backup strategy in place

### Environment Variables
- [ ] CLAUDE_API_KEY set
- [ ] JWT_SECRET set (and changed!)
- [ ] R2 bucket name correct
- [ ] D1 database ID correct
- [ ] All secrets in Cloudflare (not in code)

---

## Deployment Day (Cloudflare)

### Setup (1 hour)

```bash
# 1. Create D1 database
wrangler d1 create tony-laine-app

# 2. Load schema
wrangler d1 execute tony-laine-app --file schema.sql

# 3. Create R2 bucket
wrangler r2 bucket create tony-laine-app-uploads

# 4. Set secrets
wrangler secret put CLAUDE_API_KEY
wrangler secret put JWT_SECRET

# 5. Update wrangler.json with database_id and bucket_id
# (Get these from step 1 and 3 output)

# 6. Deploy
wrangler deploy
```

### Verification (30 min)

After deployment:
- [ ] Visit your domain
- [ ] Check login page loads
- [ ] Test API health: `/api/health`
- [ ] Test one login flow
- [ ] Check Cloudflare Analytics page
- [ ] Monitor error logs

### Domain Setup (30 min)

- [ ] Setup custom domain in Cloudflare
- [ ] Configure SSL/TLS (should be automatic)
- [ ] Update DNS records
- [ ] Test HTTPS works
- [ ] Redirect HTTP → HTTPS

---

## Post-Deployment (First Week)

### User Onboarding
- [ ] Send director access credentials
- [ ] Send animator emails with login info
- [ ] Send teacher login instructions
- [ ] Send parent signup emails
- [ ] Have support channel ready

### Monitoring
- [ ] Check error logs daily
- [ ] Monitor performance metrics
- [ ] Watch for failed uploads
- [ ] Check AI API usage
- [ ] Review user feedback

### First Run Issues
- [ ] Collect bug reports
- [ ] Fix critical bugs immediately
- [ ] Document workarounds if needed
- [ ] Update user guide if confusing
- [ ] Have rollback plan ready

### Performance Baseline
- [ ] Record page load times
- [ ] Record API response times
- [ ] Test with 50+ concurrent users
- [ ] Check database query times
- [ ] Adjust caching if needed

---

## Production (Ongoing)

### Weekly
- [ ] Check error logs
- [ ] Review performance metrics
- [ ] Respond to user feedback
- [ ] Backup database (automated?)

### Monthly
- [ ] Security audit
- [ ] Performance review
- [ ] User satisfaction survey
- [ ] Feature request review
- [ ] Update dependencies (if safe)

### Quarterly
- [ ] Full security audit
- [ ] Load testing (280+ users)
- [ ] Backup restore test
- [ ] Plan next features

---

## Rollback Plan

If deployment fails:

1. **Immediate:**
   - Keep old version URL alive
   - Notify users of issue
   - Post status update

2. **Quick Fix (< 30 min):**
   - Fix the issue locally
   - Redeploy: `wrangler deploy`

3. **Rollback (> 30 min):**
   - Use previous Cloudflare deployment
   - Revert to old Workers code
   - Keep database as-is (should be compatible)
   - Test before going live again

---

## Critical Contact Numbers

- Cloudflare support: [in dashboard]
- Claude API support: support@anthropic.com
- Internal team: [your emails]
- Emergency contacts: [list names]

---

## Password for First Login

After deployment:

**Admin/Director Access:**
- Email: director@tonylaine.fr
- Password: [temporary, change immediately]

**Test Animator:**
- Email: animator@tonylaine.fr
- Password: [temporary, change immediately]

**Test Parent:**
- Phone: +33612345678
- Password: [temporary, change immediately]

---

## Documentation Links

Before deployment, share:
- [ ] User Guide: `ONBOARDING.md`
- [ ] FAQ: [create if needed]
- [ ] Support contacts: [list]
- [ ] Known issues: [track in task.md]

---

## Final Signoff

Before clicking "Deploy":

- [ ] All team members signed off
- [ ] Director approved
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Support team ready
- [ ] Users informed of launch time

**Deployment Date:** ___________

**Deployed By:** ___________

**Approved By:** ___________

---

## After Launch Report

**Launch Date:** ___________

**Status:** ✅ Successful / ❌ Issues

**Issues Encountered:**
1. ___________
2. ___________

**Time to Full Stability:** ___________

**User Feedback:** ___________

**Next Steps:** ___________

---

Keep this checklist handy and check off as you go!

Good luck! 🚀
