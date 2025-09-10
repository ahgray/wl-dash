# Documentation Index

This directory contains comprehensive documentation for the Winners Losers and the Jets Dashboard project.

## 📚 Available Documentation

### 🚀 Getting Started
- **[README.md](../README.md)** - Main project overview, quick start guide, and basic usage
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development setup, common tasks, troubleshooting, and best practices

### 🔧 Technical Documentation
- **[API.md](./API.md)** - ESPN API integration, data processing pipeline, and caching strategy
- **[MONTE_CARLO.md](./MONTE_CARLO.md)** - In-depth explanation of the Monte Carlo simulation algorithm
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide for various platforms

## 🗂️ Documentation Structure

```
docs/
├── README.md           # This index file
├── API.md             # ESPN API integration & data flow
├── DEPLOYMENT.md      # Production deployment guide
├── DEVELOPMENT.md     # Development guide & troubleshooting
└── MONTE_CARLO.md     # Monte Carlo algorithm documentation
```

## 📖 Documentation Guide

### For New Developers
1. Start with the main [README.md](../README.md) for project overview
2. Follow [DEVELOPMENT.md](./DEVELOPMENT.md) for setup and common tasks
3. Read [API.md](./API.md) to understand data flow
4. Review [MONTE_CARLO.md](./MONTE_CARLO.md) for algorithm details

### For Deployment
1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for platform-specific instructions
2. Check [API.md](./API.md) for environment variable requirements
3. Review [DEVELOPMENT.md](./DEVELOPMENT.md) for pre-deployment checklist

### For Contributors
1. Follow guidelines in [DEVELOPMENT.md](./DEVELOPMENT.md)
2. Understand data structures in [API.md](./API.md)
3. Review algorithm concepts in [MONTE_CARLO.md](./MONTE_CARLO.md)

## 🔍 Quick Reference

### Key Files & Directories
```
├── app/page.tsx                    # Main dashboard page
├── src/components/                 # React components
├── src/utils/nflApi.ts            # ESPN API integration
├── src/utils/calculations.ts       # Monte Carlo simulations
├── config/players.json            # League configuration
└── data/                          # Runtime data files
```

### Important Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run type-check   # TypeScript validation
npm run lint         # Code linting
```

### Environment Variables
```bash
OPENAI_API_KEY                     # Optional: AI narrative generation
NEXT_PUBLIC_ESPN_API_BASE          # Optional: Custom ESPN API endpoint
NODE_ENV                           # Environment (development/production)
```

## 🆘 Getting Help

1. **Check Documentation**: Look through the relevant docs first
2. **Search Issues**: Check GitHub issues for similar problems
3. **Development Guide**: Common issues are covered in [DEVELOPMENT.md](./DEVELOPMENT.md)
4. **Create Issue**: If problem persists, create a GitHub issue with:
   - Clear problem description
   - Steps to reproduce
   - Environment details
   - Relevant log output

## 📝 Contributing to Documentation

When updating documentation:

1. **Keep it Current**: Update docs when code changes
2. **Be Specific**: Include exact commands and file paths
3. **Add Examples**: Show working code snippets
4. **Test Instructions**: Verify all commands work as documented
5. **Update Index**: Add new docs to this index file

### Documentation Standards

- **Markdown**: Use GitHub-flavored markdown
- **Code Blocks**: Include language specification for syntax highlighting
- **Headers**: Use clear, descriptive section headers
- **Links**: Use relative links for internal documentation
- **Examples**: Include working code examples
- **Screenshots**: Add visual aids where helpful (use `docs/images/` folder)

## 🏷️ Document Versions

| Document | Version | Last Updated | Notes |
|----------|---------|--------------|-------|
| README.md | 2.0 | 2025-01-XX | Initial comprehensive documentation |
| API.md | 1.0 | 2025-01-XX | ESPN API integration details |
| DEPLOYMENT.md | 1.0 | 2025-01-XX | Multi-platform deployment guide |
| DEVELOPMENT.md | 1.0 | 2025-01-XX | Developer setup and troubleshooting |
| MONTE_CARLO.md | 1.0 | 2025-01-XX | Algorithm documentation with examples |

## 🔄 Documentation Maintenance

This documentation should be reviewed and updated:

- **On Major Releases**: Update version numbers and new features
- **API Changes**: Update API.md when ESPN integration changes
- **Algorithm Updates**: Update MONTE_CARLO.md when simulation logic changes
- **New Dependencies**: Update installation instructions
- **Platform Changes**: Update DEPLOYMENT.md for new deployment options

---

**Note**: This documentation is maintained alongside the codebase. When making significant changes to the application, please update the relevant documentation to keep it current and useful for other developers.