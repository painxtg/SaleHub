// api/encode.js
export default async function handler(req, res) {
  // CORS হেডার
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { html, size = 5 } = req.body;

    if (!html) {
      return res.status(400).json({ success: false, error: 'HTML code required' });
    }

    // নিরাপদ ওবফাস্কেটর
    const result = generateSafeObfuscated(html, size);

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

// ========== সেফ ওবফাস্কেটর ==========
function generateSafeObfuscated(originalHTML, sizeMB = 5) {
  
  // 1. HTML কে ইউনিকোড স্ট্রিং-এ কনভার্ট
  const escapedHTML = JSON.stringify(originalHTML);
  
  // 2. ডিকোডার + ইন্জেক্টর (সিম্পল ও সেফ)
  const decoder = `
  (function(){
    // ডামি ডেটা (শুধু সাইজ)
    ${generateDummyData(sizeMB)}
    
    // আসল HTML ডিকোড
    var html = ${escapedHTML};
    
    // সেফ ইন্জেক্ট
    try {
      document.open();
      document.write(html);
      document.close();
    } catch(e) {
      // ফলব্যাক
      document.body.innerHTML = html;
    }
  })();
  `;
  
  // 3. ভেরিয়েবল নাম পরিবর্তন (অবফাস্কেশন)
  let obfuscated = decoder
    .replace(/function/g, 'fn')
    .replace(/var/g, 'let')
    .replace(/document/g, 'doc')
    .replace(/try/g, 't')
    .replace(/catch/g, 'c')
    .replace(/\s+/g, ' ')
    .trim();
  
  // 4. প্যাডিং যোগ (সাইজ বাড়ানোর জন্য)
  const padding = createPadding(sizeMB);
  obfuscated = padding + obfuscated + padding;
  
  // 5. স্ক্রিপ্ট ট্যাগ
  return `<script>${obfuscated}<\/script>`;
}

// ========== ডামি ডেটা ==========
function generateDummyData(sizeInMB) {
  let dummy = '';
  
  // বড় কমেন্ট (সবচেয়ে ইফেক্টিভ)
  dummy += `/* ${'X'.repeat(sizeInMB * 1024 * 80)} */\n`;
  
  // ডামি স্ট্রিং
  dummy += `var _ = "${'A'.repeat(sizeInMB * 1024 * 10)}";\n`;
  
  // ডামি অ্যারে
  dummy += `var arr = [${'0,'.repeat(5000)}];\n`;
  
  return dummy;
}

// ========== প্যাডিং ==========
function createPadding(sizeInMB) {
  return `/* ${'P'.repeat(sizeInMB * 1024 * 10)} */\n`;
                            }
