package ma.newdev.rh;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestBcrypt {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("HASH FOR password123: " + encoder.encode("password123"));
        System.out.println("MATCHES seeder hash with password: " + encoder.matches("password", "$2a$10$MV3A0JDLQepHDre7.Lb5AerhMzJBijef1vfEZ4VcMuzW1dJrn55Vy"));
        System.out.println("MATCHES seeder hash with password123: " + encoder.matches("password123", "$2a$10$MV3A0JDLQepHDre7.Lb5AerhMzJBijef1vfEZ4VcMuzW1dJrn55Vy"));
        System.out.println("MATCHES seeder hash with admin: " + encoder.matches("admin", "$2a$10$MV3A0JDLQepHDre7.Lb5AerhMzJBijef1vfEZ4VcMuzW1dJrn55Vy"));
    }
}
