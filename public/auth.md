# auth.md

CivicBrands publishes public-interest information, records, research, and machine-readable resources at https://civicbrands.org.

## Agent access

Public pages and publicly published machine-readable resources may be accessed by agents without registration unless a resource states otherwise.

CivicBrands does not currently advertise an open automated agent-registration endpoint.

Protected services, authenticated APIs, or delegated agent access may be introduced separately. When available, their authentication and authorization metadata will be published through the applicable OAuth discovery and protected-resource metadata endpoints.

## Public resources

Agents may use publicly available CivicBrands resources subject to the same provenance, attribution, integrity, and use constraints applicable to other users.

Canonical public site:

https://civicbrands.org

Machine-readable discovery documents, when available, are published beneath:

https://civicbrands.org/.well-known/

## Agent identity

Agents should identify themselves accurately when interacting with CivicBrands services and must not misrepresent their operator, authority, or relationship to CivicBrands.

Where authenticated or cryptographically verifiable agent identity is required, the relevant service will advertise the supported authentication method and credential requirements.

## Registration and provisioning

CivicBrands does not currently offer unrestricted automated agent account creation.

Where access to a protected agent-facing service is available, provisioning and authorization requirements will be documented by that service.

## Security

Credentials must be sent only to the service and endpoint for which they were issued.

Do not send credentials, bearer tokens, private keys, or other secrets to public CivicBrands content endpoints.

## Discovery

Additional standards-based discovery documents may be published as corresponding services become operational, including OAuth Protected Resource Metadata, OAuth or OpenID Connect metadata, MCP Server Cards, A2A Agent Cards, Agent Skills indexes, and HTTP message-signature key directories.