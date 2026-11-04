import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';
import { storage } from './storage';

const execPromise = util.promisify(exec);

export interface GitHubSyncParams {
  repoUrl: string;
  githubToken: string;
}

export interface GitHubSyncResult {
  success: boolean;
  message: string;
  repoUrl?: string;
  secretsSummary?: { key: string; description: string; configured: boolean }[];
  error?: string;
}

export async function syncToGitHub(params: GitHubSyncParams): Promise<GitHubSyncResult> {
  const { repoUrl, githubToken } = params;

  if (!repoUrl || !repoUrl.trim()) {
    return { success: false, message: 'GitHub repozitoriyasının linki tələb olunur.' };
  }
  if (!githubToken || !githubToken.trim()) {
    return { success: false, message: 'GitHub Personal Access Token (PAT) tələb olunur.' };
  }

  // Parse repo owner and name (e.g., https://github.com/owner/repo or owner/repo)
  const cleanUrl = repoUrl.trim().replace(/\.git$/, '');
  const match = cleanUrl.match(/(?:github\.com\/|^)([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$/);

  if (!match) {
    return {
      success: false,
      message: 'Yanlış GitHub repo formatı. Nümunə: https://github.com/istifadeci/bot-repo'
    };
  }

  const owner = match[1];
  const repo = match[2];
  const token = githubToken.trim();
  const rootDir = process.cwd();

  try {
    storage.addLog('info', `GitHub sinxronizasiyası başladıldı: ${owner}/${repo}`);

    // Ensure git user config
    await execPromise('git config user.name "AAQ Bot Engine"', { cwd: rootDir });
    await execPromise('git config user.email "bot@aaq.local"', { cwd: rootDir });

    // Ensure git repo initialized
    const gitDir = path.join(rootDir, '.git');
    if (!fs.existsSync(gitDir)) {
      await execPromise('git init -b main', { cwd: rootDir });
    }

    // Ensure safe README is present
    const readmePath = path.join(rootDir, 'README.md');
    if (!fs.existsSync(readmePath)) {
      const readmeContent = `# AAQ - Ahl Al Qalam Telegram Bot & Keep-Alive System\n\nBu repozitoriya AAQ Telegram Botunun tam və optimallaşdırılmış kod bazasını ehtiva edir.\n\n## ⚙️ Təhlükəsiz Quraşdırma & Gizli Açar Dəyişənləri\nBu repoda gizli açarlar koddan təcrid olunub. Reponuzun **Settings -> Secrets and variables -> Actions** bölməsinə aşağıdakı dəyişənləri əlavə edin:\n- \`BOT_TOKEN\`: Telegram BotFather tokeniniz\n- \`GEMINI_API_KEY\`: Google Gemini AI API açarınız\n- \`ADMIN_SECRET_KEY\`: Rəhbər idarəetmə açarı\n\n## 🚀 Başlamaq\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`;
      fs.writeFileSync(readmePath, readmeContent, 'utf-8');
    }

    // Add all files respecting .gitignore
    await execPromise('git add -A', { cwd: rootDir });

    // Check if there are changes to commit
    try {
      await execPromise('git commit -m "AAQ - Ahl Al Qalam Bot Code & Fast AI Engine"', { cwd: rootDir });
    } catch {
      // Nothing to commit is fine
    }

    // Set branch to main
    await execPromise('git branch -M main', { cwd: rootDir });

    // Configure authenticated remote
    const remoteUrl = `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;
    try {
      await execPromise('git remote remove origin', { cwd: rootDir });
    } catch {
      // ignore
    }
    await execPromise(`git remote add origin ${remoteUrl}`, { cwd: rootDir });

    // Push to GitHub repository
    await execPromise('git push -u origin main --force', { cwd: rootDir });

    // Clean remote origin to not leave token in .git/config
    try {
      await execPromise(`git remote set-url origin https://github.com/${owner}/${repo}.git`, { cwd: rootDir });
    } catch {
      // ignore
    }

    const currentConfig = storage.getConfig();
    const secretsSummary = [
      {
        key: 'BOT_TOKEN',
        description: 'Telegram Bot Token (BotFather)',
        configured: !!currentConfig.botToken
      },
      {
        key: 'GEMINI_API_KEY',
        description: 'Google Gemini AI Model Açarı',
        configured: !!process.env.GEMINI_API_KEY
      },
      {
        key: 'ADMIN_SECRET_KEY',
        description: 'AAQ Baş Admin Parolu',
        configured: !!currentConfig.adminSecretKey
      },
      {
        key: 'APP_URL',
        description: 'Cloud Run / Webhook Host URL',
        configured: !!currentConfig.webhookUrl
      }
    ];

    storage.addLog('info', `GitHub-a uğurla push olundu: https://github.com/${owner}/${repo}`);

    return {
      success: true,
      message: `Kodlar uğurla https://github.com/${owner}/${repo} reponuza yükləndi!`,
      repoUrl: `https://github.com/${owner}/${repo}`,
      secretsSummary
    };
  } catch (err: any) {
    // Clean potential token from error message
    const sanitizedError = (err?.message || String(err)).replace(new RegExp(token, 'g'), '***');
    storage.addLog('error', `GitHub sync xətası: ${sanitizedError}`);
    return {
      success: false,
      message: `GitHub-a yükləmə zamanı xəta baş verdi: ${sanitizedError}`,
      error: sanitizedError
    };
  }
}
