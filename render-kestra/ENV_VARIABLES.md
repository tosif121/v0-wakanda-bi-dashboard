# 🔧 Kestra Environment Variables Reference

## Official Kestra Configuration Patterns

This deployment follows Kestra's official environment variable naming conventions as documented in their configuration guide.

### **Server Configuration**
```bash
KESTRA_SERVER_PORT=10000                    # Server port (Render requirement)
JAVA_OPTS="-Xmx512m -Xms256m"             # JVM memory settings
```

### **Security Configuration** 
```bash
KESTRA_SECURITY_BASIC_USERNAME=your_username     # Basic auth username
KESTRA_SECURITY_BASIC_PASSWORD=your_password     # Basic auth password
```

### **Database Configuration**
```bash
KESTRA_DATASOURCES_POSTGRES_PASSWORD=db_password  # H2 database password
```

### **Application Variables**
```bash
PERPLEXITY_API_KEY=your_perplexity_key    # AI analysis service
SUPABASE_URL=your_supabase_url            # Database connection
SUPABASE_KEY=your_supabase_key            # Database authentication
```

## Configuration Mapping

The environment variables map to the following configuration paths in `kestra-config.yml`:

| Environment Variable | Configuration Path |
|---------------------|-------------------|
| `KESTRA_SERVER_PORT` | `kestra.server.port` |
| `KESTRA_SECURITY_BASIC_USERNAME` | `kestra.security.basic.username` |
| `KESTRA_SECURITY_BASIC_PASSWORD` | `kestra.security.basic.password` |
| `KESTRA_DATASOURCES_POSTGRES_PASSWORD` | `kestra.datasources.postgres.password` |

## Kestra Documentation References

- **Configuration Guide**: [kestra.io/docs/configuration](https://kestra.io/docs/configuration)
- **Environment Variables**: [kestra.io/docs/configuration/environment-variables](https://kestra.io/docs/configuration/environment-variables)
- **Security Configuration**: [kestra.io/docs/configuration/security](https://kestra.io/docs/configuration/security)

## Validation

To verify your configuration is correct:
1. Check Kestra startup logs for configuration validation
2. Ensure all required environment variables are set
3. Test authentication with your chosen credentials
4. Verify database connectivity and persistence

---
**Note**: These patterns ensure compatibility with Kestra's official configuration system and follow their documented best practices.