#!/usr/bin/env node

/**
 * Script de Auditoria de Segurança
 * 
 * Este script executa auditoria de segurança nas dependências do projeto,
 * gerando relatórios detalhados e falhando em caso de vulnerabilidades críticas.
 * 
 * Usa npm audit como alternativa ao pnpm audit (que pode estar bloqueado).
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações
const CONFIG = {
  reportDir: path.join(__dirname, '..', 'audit-reports'),
  criticalThreshold: 0, // Número máximo de vulnerabilidades críticas permitidas
  highThreshold: 5,     // Número máximo de vulnerabilidades altas permitidas
  generatePackageLock: true, // Gerar package-lock.json temporário para usar npm audit
};

// Níveis de severidade
const SEVERITY_LEVELS = {
  critical: { color: '\x1b[41m\x1b[37m', level: 4, emoji: '🔴' },
  high: { color: '\x1b[31m', level: 3, emoji: '🟠' },
  moderate: { color: '\x1b[33m', level: 2, emoji: '🟡' },
  low: { color: '\x1b[32m', level: 1, emoji: '🟢' },
  info: { color: '\x1b[36m', level: 0, emoji: 'ℹ️' },
};

const RESET_COLOR = '\x1b[0m';

/**
 * Cria o diretório de relatórios se não existir
 */
function ensureReportDir() {
  if (!fs.existsSync(CONFIG.reportDir)) {
    fs.mkdirSync(CONFIG.reportDir, { recursive: true });
    console.log(`📁 Diretório de relatórios criado: ${CONFIG.reportDir}`);
  }
}

/**
 * Gera timestamp para os nomes de arquivo
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
         now.toTimeString().split(' ')[0].replace(/:/g, '-');
}

/**
 * Executa comando e retorna output
 */
function execCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options,
    });
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: error.stdout || '',
      error: error.stderr || error.message,
      code: error.status,
    };
  }
}

/**
 * Gera package-lock.json temporário a partir do pnpm-lock.yaml
 */
function generatePackageLock() {
  console.log('\n🔄 Tentando gerar package-lock.json temporário...');
  
  const lockExists = fs.existsSync('package-lock.json');
  const backupPath = lockExists ? 'package-lock.json.backup' : null;
  
  if (lockExists) {
    fs.copyFileSync('package-lock.json', backupPath);
    console.log('   Backup do package-lock.json existente criado');
  }
  
  // Tenta npm install com timeout curto
  console.log('   Nota: Este processo pode demorar. Aguarde...');
  
  try {
    const result = execSync('timeout 60 npm install --package-lock-only --legacy-peer-deps 2>&1 || true', {
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: 'pipe',
    });
    
    if (fs.existsSync('package-lock.json') && fs.statSync('package-lock.json').size > 100) {
      console.log('✅ package-lock.json gerado com sucesso');
      return true;
    }
  } catch (error) {
    // Ignora erros de timeout
  }
  
  console.warn('⚠️  Aviso: Não foi possível gerar package-lock.json automaticamente');
  console.log('   Tentando usar pnpm audit como fallback...');
  
  if (backupPath && fs.existsSync(backupPath)) {
    if (fs.existsSync('package-lock.json')) {
      fs.unlinkSync('package-lock.json');
    }
    fs.renameSync(backupPath, 'package-lock.json');
  }
  return false;
}

/**
 * Remove package-lock.json temporário
 */
function cleanupPackageLock() {
  if (fs.existsSync('package-lock.json.backup')) {
    fs.unlinkSync('package-lock.json');
    fs.renameSync('package-lock.json.backup', 'package-lock.json');
    console.log('🧹 package-lock.json restaurado do backup');
  } else if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
    console.log('🧹 package-lock.json temporário removido');
  }
}

/**
 * Executa npm audit e retorna resultado
 */
function runNpmAudit() {
  console.log('\n🔍 Executando npm audit...\n');
  
  // Tenta audit em formato JSON
  const jsonResult = execCommand('npm audit --json');
  
  if (!jsonResult.success && jsonResult.code !== 1) {
    // Código 1 significa que encontrou vulnerabilidades, o que é esperado
    console.error('❌ Erro ao executar npm audit');
    return null;
  }
  
  let auditData;
  try {
    auditData = JSON.parse(jsonResult.output);
  } catch (e) {
    console.error('❌ Erro ao parsear resultado do audit:', e.message);
    return null;
  }
  
  return auditData;
}

/**
 * Executa pnpm audit como fallback
 */
function runPnpmAudit() {
  console.log('\n🔍 Tentando pnpm audit...\n');
  
  const jsonResult = execCommand('pnpm audit --json');
  
  if (!jsonResult.success && jsonResult.code !== 1) {
    // Verifica se é erro conhecido do Cloudflare
    if (jsonResult.output && jsonResult.output.includes('ERR_PNPM_AUDIT_BAD_RESPONSE')) {
      console.warn('⚠️  pnpm audit bloqueado (erro 400 do Cloudflare/registry)');
      return null;
    }
    console.error('❌ Erro ao executar pnpm audit');
    console.error('   Mensagem:', jsonResult.error);
    return null;
  }
  
  let auditData;
  try {
    auditData = JSON.parse(jsonResult.output);
    
    // Verifica se tem erro no JSON
    if (auditData.error) {
      console.warn('⚠️  pnpm audit retornou erro:', auditData.error.message);
      return null;
    }
  } catch (e) {
    console.error('❌ Erro ao parsear resultado do pnpm audit:', e.message);
    return null;
  }
  
  return auditData;
}

/**
 * Processa e formata dados do audit
 */
function processAuditData(auditData, isPnpm = false) {
  if (!auditData) {
    return null;
  }
  
  const summary = {
    total: 0,
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    info: 0,
    vulnerabilities: [],
  };
  
  // Formato pnpm audit
  if (isPnpm && auditData.advisories) {
    Object.entries(auditData.advisories).forEach(([id, advisory]) => {
      const severity = advisory.severity || 'info';
      summary[severity]++;
      summary.total++;
      
      summary.vulnerabilities.push({
        name: advisory.module_name || advisory.name || id,
        severity,
        title: advisory.title || 'Vulnerabilidade detectada',
        range: advisory.vulnerable_versions || advisory.findings?.[0]?.version || '*',
        fixAvailable: advisory.patched_versions !== '<0.0.0',
        url: advisory.url || `https://npmjs.com/advisories/${id}`,
      });
    });
    return summary;
  }
  
  // Extrai vulnerabilidades do formato npm audit
  if (auditData.vulnerabilities) {
    Object.entries(auditData.vulnerabilities).forEach(([name, vuln]) => {
      const severity = vuln.severity || 'info';
      summary[severity]++;
      summary.total++;
      
      summary.vulnerabilities.push({
        name,
        severity,
        title: vuln.via?.[0]?.title || 'Vulnerabilidade detectada',
        range: vuln.range || '*',
        fixAvailable: vuln.fixAvailable || false,
        url: vuln.via?.[0]?.url || '',
      });
    });
  } else if (auditData.metadata && auditData.metadata.vulnerabilities) {
    // Formato alternativo
    const meta = auditData.metadata.vulnerabilities;
    summary.critical = meta.critical || 0;
    summary.high = meta.high || 0;
    summary.moderate = meta.moderate || 0;
    summary.low = meta.low || 0;
    summary.info = meta.info || 0;
    summary.total = meta.total || 0;
  }
  
  return summary;
}

/**
 * Imprime sumário no console
 */
function printSummary(summary) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMO DA AUDITORIA DE SEGURANÇA');
  console.log('='.repeat(70));
  
  console.log(`\n${SEVERITY_LEVELS.critical.emoji} Críticas:   ${summary.critical}`);
  console.log(`${SEVERITY_LEVELS.high.emoji} Altas:       ${summary.high}`);
  console.log(`${SEVERITY_LEVELS.moderate.emoji} Moderadas:   ${summary.moderate}`);
  console.log(`${SEVERITY_LEVELS.low.emoji} Baixas:      ${summary.low}`);
  console.log(`${SEVERITY_LEVELS.info.emoji} Info:        ${summary.info}`);
  console.log(`\n📦 Total:       ${summary.total}`);
  
  console.log('\n' + '='.repeat(70));
}

/**
 * Imprime detalhes das vulnerabilidades críticas e altas
 */
function printCriticalVulnerabilities(summary) {
  const critical = summary.vulnerabilities.filter(v => v.severity === 'critical');
  const high = summary.vulnerabilities.filter(v => v.severity === 'high');
  
  if (critical.length > 0) {
    console.log('\n🔴 VULNERABILIDADES CRÍTICAS:\n');
    critical.forEach((vuln, idx) => {
      console.log(`${idx + 1}. ${vuln.name}`);
      console.log(`   Descrição: ${vuln.title}`);
      console.log(`   Versão afetada: ${vuln.range}`);
      console.log(`   Correção disponível: ${vuln.fixAvailable ? '✅ Sim' : '❌ Não'}`);
      if (vuln.url) console.log(`   Mais info: ${vuln.url}`);
      console.log('');
    });
  }
  
  if (high.length > 0) {
    console.log('🟠 VULNERABILIDADES ALTAS:\n');
    high.forEach((vuln, idx) => {
      console.log(`${idx + 1}. ${vuln.name}`);
      console.log(`   Descrição: ${vuln.title}`);
      console.log(`   Versão afetada: ${vuln.range}`);
      console.log(`   Correção disponível: ${vuln.fixAvailable ? '✅ Sim' : '❌ Não'}`);
      if (vuln.url) console.log(`   Mais info: ${vuln.url}`);
      console.log('');
    });
  }
}

/**
 * Salva relatórios em disco
 */
function saveReports(auditData, summary) {
  ensureReportDir();
  const timestamp = getTimestamp();
  
  // Relatório JSON completo
  const jsonPath = path.join(CONFIG.reportDir, `audit-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(auditData, null, 2));
  console.log(`\n💾 Relatório JSON salvo: ${jsonPath}`);
  
  // Relatório de texto
  const txtPath = path.join(CONFIG.reportDir, `audit-${timestamp}.txt`);
  let txtReport = '='.repeat(70) + '\n';
  txtReport += 'RELATÓRIO DE AUDITORIA DE SEGURANÇA\n';
  txtReport += `Data: ${new Date().toLocaleString('pt-BR')}\n`;
  txtReport += '='.repeat(70) + '\n\n';
  
  txtReport += 'RESUMO:\n';
  txtReport += `  Críticas:   ${summary.critical}\n`;
  txtReport += `  Altas:      ${summary.high}\n`;
  txtReport += `  Moderadas:  ${summary.moderate}\n`;
  txtReport += `  Baixas:     ${summary.low}\n`;
  txtReport += `  Info:       ${summary.info}\n`;
  txtReport += `  Total:      ${summary.total}\n\n`;
  
  if (summary.vulnerabilities.length > 0) {
    txtReport += '='.repeat(70) + '\n';
    txtReport += 'DETALHES DAS VULNERABILIDADES\n';
    txtReport += '='.repeat(70) + '\n\n';
    
    summary.vulnerabilities.forEach((vuln, idx) => {
      txtReport += `${idx + 1}. ${vuln.name} [${vuln.severity.toUpperCase()}]\n`;
      txtReport += `   Descrição: ${vuln.title}\n`;
      txtReport += `   Versão afetada: ${vuln.range}\n`;
      txtReport += `   Correção disponível: ${vuln.fixAvailable ? 'Sim' : 'Não'}\n`;
      if (vuln.url) txtReport += `   URL: ${vuln.url}\n`;
      txtReport += '\n';
    });
  }
  
  fs.writeFileSync(txtPath, txtReport);
  console.log(`💾 Relatório TXT salvo: ${txtPath}`);
  
  // Link simbólico para o último relatório
  const latestJson = path.join(CONFIG.reportDir, 'latest.json');
  const latestTxt = path.join(CONFIG.reportDir, 'latest.txt');
  
  if (fs.existsSync(latestJson)) fs.unlinkSync(latestJson);
  if (fs.existsSync(latestTxt)) fs.unlinkSync(latestTxt);
  
  fs.symlinkSync(path.basename(jsonPath), latestJson);
  fs.symlinkSync(path.basename(txtPath), latestTxt);
}

/**
 * Verifica se deve falhar com base nos thresholds
 */
function shouldFail(summary) {
  if (summary.critical > CONFIG.criticalThreshold) {
    return {
      fail: true,
      reason: `Encontradas ${summary.critical} vulnerabilidades críticas (máximo permitido: ${CONFIG.criticalThreshold})`,
    };
  }
  
  if (summary.high > CONFIG.highThreshold) {
    return {
      fail: true,
      reason: `Encontradas ${summary.high} vulnerabilidades altas (máximo permitido: ${CONFIG.highThreshold})`,
    };
  }
  
  return { fail: false };
}

/**
 * Função principal
 */
async function main() {
  console.log('🔒 Iniciando Auditoria de Segurança\n');
  console.log(`📂 Diretório: ${process.cwd()}`);
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}\n`);
  
  let lockGenerated = false;
  let usedPnpm = false;
  
  try {
    // Tenta primeiro com pnpm audit (nativo)
    let auditData = runPnpmAudit();
    
    if (auditData) {
      usedPnpm = true;
      console.log('✅ Usando pnpm audit');
    } else {
      console.log('⚠️  pnpm audit falhou, tentando npm audit...');
      
      // Gera package-lock.json se necessário
      if (CONFIG.generatePackageLock && !fs.existsSync('package-lock.json')) {
        lockGenerated = generatePackageLock();
        
        if (!lockGenerated) {
          console.error('\n❌ Não foi possível executar auditoria');
          console.log('💡 Sugestões:');
          console.log('   1. Verifique sua conexão com a internet');
          console.log('   2. Tente executar "pnpm audit" manualmente');
          console.log('   3. Configure acesso a registry alternativo se necessário\n');
          process.exit(1);
        }
      }
      
      // Executa npm audit
      auditData = runNpmAudit();
    }
    
    if (!auditData) {
      console.error('\n❌ Falha ao executar auditoria\n');
      process.exit(1);
    }
    
    // Processa resultados
    const summary = processAuditData(auditData, usedPnpm);
    
    if (!summary) {
      console.error('\n❌ Falha ao processar resultados da auditoria\n');
      process.exit(1);
    }
    
    // Imprime resumo
    printSummary(summary);
    
    // Imprime vulnerabilidades críticas e altas
    if (summary.critical > 0 || summary.high > 0) {
      printCriticalVulnerabilities(summary);
    }
    
    // Salva relatórios
    saveReports(auditData, summary);
    
    // Verifica se deve falhar
    const failCheck = shouldFail(summary);
    
    if (failCheck.fail) {
      console.log('\n❌ AUDITORIA FALHOU\n');
      console.log(`   Razão: ${failCheck.reason}\n`);
      console.log('💡 Execute "pnpm audit:fix" ou "npm audit fix" para tentar corrigir automaticamente\n');
      process.exit(1);
    }
    
    console.log('\n✅ AUDITORIA CONCLUÍDA COM SUCESSO\n');
    
    if (summary.total > 0) {
      console.log('⚠️  Vulnerabilidades encontradas, mas dentro dos limites aceitáveis');
      console.log('📝 Revise o relatório e planeje correções\n');
    } else {
      console.log('🎉 Nenhuma vulnerabilidade encontrada!\n');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erro durante auditoria:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    if (lockGenerated) {
      cleanupPackageLock();
    }
  }
}

// Executa
if (require.main === module) {
  main();
}

module.exports = { main };
