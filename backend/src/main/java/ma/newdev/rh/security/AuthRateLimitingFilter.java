package ma.newdev.rh.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuthRateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        // 5 requests per 15 minutes
        Bandwidth limit = Bandwidth.builder()
                .capacity(50)
                .refillGreedy(50, Duration.ofMinutes(15))
                .build();
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket resolveBucket(String ip) {
        return cache.computeIfAbsent(ip, k -> createNewBucket());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        
        // Only apply rate limiting to authentication endpoints
        if (path.startsWith("/api/auth/")) {
            String ip = request.getRemoteAddr();
            // Try to get real IP if behind proxy
            String xfHeader = request.getHeader("X-Forwarded-For");
            if (xfHeader != null && !xfHeader.isEmpty()) {
                ip = xfHeader.split(",")[0];
            }
            
            Bucket bucket = resolveBucket(ip);
            if (bucket.tryConsume(1)) {
                filterChain.doFilter(request, response);
            } else {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"success\":false,\"message\":\"Trop de tentatives. Veuillez réessayer plus tard.\"}");
            }
        } else {
            filterChain.doFilter(request, response);
        }
    }
}
