# Security Policy

## Supported Versions

We actively support the following versions of our application:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it to us responsibly:

### How to Report

1. **Email**: Send details to security@rokdbot.com
2. **Discord**: Contact admin on our Discord server (private message)
3. **GitHub**: Create a private security advisory

### What to Include

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fixes (if any)

### Response Timeline

- **Initial Response**: Within 24 hours
- **Status Update**: Within 72 hours  
- **Resolution**: Within 7-14 days (depending on severity)

## Security Measures

### Dependencies
- Regular security audits with `npm audit`
- Automated dependency updates
- No known vulnerable packages

### Application Security
- Input validation with Zod schemas
- SQL injection prevention with Prisma ORM
- XSS protection with Next.js built-in security
- CSRF protection with NextAuth.js
- Secure headers configuration
- Environment variable security

### Data Protection
- Password hashing with bcrypt
- JWT token security
- Database access controls
- Email validation and sanitization

### Infrastructure
- HTTPS enforcement
- Secure cookie settings
- Rate limiting implementation
- Error handling without information leakage

## Security Best Practices

### For Users
- Use strong, unique passwords
- Enable two-factor authentication when available
- Keep your browser updated
- Report suspicious activities

### For Developers
- Follow secure coding practices
- Regular security testing
- Code review process
- Keep dependencies updated

## Contact

For security-related questions or concerns:
- Email: security@rokdbot.com
- Response time: 24-48 hours