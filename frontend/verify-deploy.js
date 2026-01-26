#!/usr/bin/env node

/**
 * Script de verificación para validar la configuración antes del despliegue
 */

console.log('🔍 Verificando configuración de despliegue...\n');

// Verificar que existe el archivo de configuración de axios
const fs = require('fs');
const path = require('path');

const checks = [
    {
        name: 'Archivo de configuración de Axios',
        path: './src/config/axios.js',
        required: true
    },
    {
        name: 'Dockerfile con ARG VITE_API_URL',
        path: './Dockerfile',
        required: true,
        contains: 'ARG VITE_API_URL'
    },
    {
        name: 'vite.config.js con define',
        path: './vite.config.js',
        required: true,
        contains: 'import.meta.env.VITE_API_URL'
    }
];

let allPassed = true;

checks.forEach(check => {
    const filePath = path.join(__dirname, check.path);

    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${check.name}: No encontrado`);
        if (check.required) allPassed = false;
        return;
    }

    if (check.contains) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (!content.includes(check.contains)) {
            console.log(`❌ ${check.name}: No contiene "${check.contains}"`);
            if (check.required) allPassed = false;
            return;
        }
    }

    console.log(`✅ ${check.name}`);
});

console.log('\n📋 Variables de entorno requeridas en Railway:');
console.log('   VITE_API_URL=https://tu-backend-production.up.railway.app');

if (allPassed) {
    console.log('\n✨ ¡Todo listo para desplegar!\n');
    console.log('📚 Lee RAILWAY_DEPLOY.md para los próximos pasos.\n');
} else {
    console.log('\n⚠️  Hay problemas que debes resolver antes de desplegar.\n');
    process.exit(1);
}
