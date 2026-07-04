// api/encode.js
export default async function handler(req, res) {
  // CORS হেডার
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS প্রাক-ফ্লাইট রিকোয়েস্ট
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // শুধু POST অ্যালাউড
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method Not Allowed' 
    });
  }

  try {
    const { html, size = 10 } = req.body;

    if (!html) {
      return res.status(400).json({
        success: false,
        error: 'HTML code required'
      });
    }

    // ওবফাস্কেট ফাংশন
    const result = obfuscateHTML(html, size);

    return res.status(200).json({
      success: true,
      result: result,
      stats: {
        originalSize: html.length,
        newSize: result.length,
        sizeInMB: (result.length / (1024 * 1024)).toFixed(2),
        increasedBy: ((result.length / html.length) * 100).toFixed(0) + 'x'
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ========== ওবফাস্কেটর ফাংশন ==========
function generateDummyData(sizeInMB) {
  return '// ' + 'A'.repeat(sizeInMB * 1024 * 1024) + '\n';
}

function obfuscateHTML(originalHTML, sizeMB = 10) {
  const htmlString = JSON.stringify(originalHTML);
  
  const decoder = `
  (function(){
    const _dummy = \`${generateDummyData(sizeMB)}\`;
    const _html = ${htmlString};
    document.open();
    document.write(_html);
    document.close();
  })();
  `;
  
  let obfuscated = decoder
    .replace(/function/g, 'fn')
    .replace(/const/g, 'let')
    .replace(/\s+/g, ' ')
    .trim();
  
  const padding = '/* ' + 'x'.repeat(sizeMB * 1024 * 50) + ' */\n';
  obfuscated = padding + obfuscated + padding;
  
  return `<script>${obfuscated}<\/script>`;
}