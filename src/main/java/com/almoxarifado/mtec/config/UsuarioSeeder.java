package com.almoxarifado.mtec.config;

import com.almoxarifado.mtec.entities.Usuario;
import com.almoxarifado.mtec.enums.Perfil;
import com.almoxarifado.mtec.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class UsuarioSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioSeeder(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            return;
        }
        Usuario admin = new Usuario();
        admin.setNome("Administrador");
        admin.setEmail("admin@mtec.com");
        admin.setSenha(passwordEncoder.encode("admin123"));
        admin.setPerfil(Perfil.ADMIN);
        usuarioRepository.save(admin);
    }
}