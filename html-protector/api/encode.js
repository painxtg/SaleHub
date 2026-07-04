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
    const { html, size = 10 } = req.body;

    if (!html) {
      return res.status(400).json({ success: false, error: 'HTML code required' });
    }

    // ওবফাস্কেট + এক্সিকিউটেবল কোড জেনারেট
    const result = generateExecutableObfuscated(html, size);

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
    return res.status(500).json({ success: false, error: error.message });
  }
}

// ========== মেইন ফাংশন ==========
function generateExecutableObfuscated(originalHTML, sizeMB = 10) {
  
  // 1. আসল HTML কে বেস৬৪ এনকোড করুন
  const base64HTML = Buffer.from(originalHTML).toString('base64');
  
  // 2. ডামি ডেটা জেনারেট (শুধু আকার বাড়ানোর জন্য)
  const dummyData = generateDummyData(sizeMB);
  
  // 3. ডিকোডার + এক্সিকিউটর স্ক্রিপ্ট
  const executableScript = `
  (function(){
    // ===== ডামি ডেটা (শুধু সাইজ বাড়ানোর জন্য) =====
    ${dummyData}
    
    // ===== আসল কোড ডিকোড =====
    const _encoded = "${base64HTML}";
    const _decoded = atob(_encoded);
    
    // ===== ডকুমেন্টে ইঞ্জেক্ট =====
    document.open();
    document.write(_decoded);
    document.close();
    
    // ===== স্ক্রিপ্ট রান করান =====
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if(script.src) {
        const newScript = document.createElement('script');
        newScript.src = script.src;
        document.head.appendChild(newScript);
      } else if(script.textContent) {
        eval(script.textContent);
      }
    });
  })();
  `;
  
  // 4. অবফাস্কেট করুন (ভেরিয়েবল/ফাংশন নাম পরিবর্তন)
  let obfuscated = executableScript
    .replace(/function/g, 'fn')
    .replace(/const/g, 'let')
    .replace(/document/g, 'doc')
    .replace(/window/g, 'win')
    .replace(/eval/g, 'ev')
    .replace(/\s+/g, ' ')
    .trim();
  
  // 5. মাল্টি-লাইন কমেন্ট দিয়ে আরও সাইজ বাড়ান
  const padding = createPadding(sizeMB);
  obfuscated = padding + obfuscated + padding;
  
  // 6. স্ক্রিপ্ট ট্যাগে র‍্যাপ
  return `<script>${obfuscated}<\/script>`;
}

// ========== ডামি ডেটা জেনারেটর ==========
function generateDummyData(sizeInMB) {
  let dummy = '';
  // ফাংশন ডিক্লেয়ারেশন
  for(let i = 0; i < 50; i++) {
    dummy += `function _dummy${i}(){ return "${'A'.repeat(1000)}"; }\n`;
  }
  // ডামি অ্যারে
  dummy += `const _bigArray = [${'1000,'.repeat(1000)}];\n`;
  // ডামি লুপ
  dummy += `for(let _i=0; _i<1000; _i++){ _bigArray.push(_i); }\n`;
  // বড় কমেন্ট
  dummy += `/* ${'X'.repeat(sizeInMB * 1024 * 50)} */\n`;
  
  return dummy;
}

// ========== প্যাডিং জেনারেটর ==========
function createPadding(sizeInMB) {
  let padding = '';
  // ৫০% প্যাডিং কমেন্ট
  padding += `/* ${'P'.repeat(sizeInMB * 1024 * 25)} */\n`;
  // ৫০% প্যাডিং স্ট্রিং
  padding += `const _pad = "${'Z'.repeat(sizeInMB * 1024 * 25)}";\n`;
  return padding;
}
