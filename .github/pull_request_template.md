## 📋 Pull Request Checklist

### 🔍 Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality) 
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🔧 Configuration change
- [ ] 🔒 Security improvement

### 🛡️ Security Checklist
- [ ] No hardcoded API keys, tokens, or secrets
- [ ] No sensitive data in logs or console outputs
- [ ] Input validation implemented where needed
- [ ] XSS protection considered
- [ ] SQL injection protection verified (if applicable)
- [ ] Authentication/authorization properly implemented
- [ ] RLS policies updated (if database changes)

### 🧪 Testing Checklist
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI changes)
- [ ] Mobile responsiveness checked (if UI changes)
- [ ] Accessibility guidelines followed

### 📊 Impact Assessment
- [ ] Database migrations required: **Yes / No**
- [ ] Environment variables needed: **Yes / No**
- [ ] Third-party integrations affected: **Yes / No**
- [ ] Breaking changes for existing users: **Yes / No**

### 📝 Description
**What does this PR do?**
<!-- Describe your changes in detail -->

**Why is this change needed?**
<!-- Explain the business case or technical reason -->

**How should this be tested?**
<!-- Provide steps to test the changes -->

### 🔗 Related Issues
Closes # <!-- Issue number if applicable -->

### 📸 Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

### ⚠️ Additional Notes
<!-- Any additional information for reviewers -->

---
**Reviewer Guidelines:**
- Check that all security items are addressed
- Verify test coverage is adequate  
- Ensure code follows project conventions
- Validate that breaking changes are documented