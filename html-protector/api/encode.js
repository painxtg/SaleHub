// api/encode.js - BJ_DEVS স্টাইল এনক্রিপ্টর
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { code, size = 5 } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Code required' });
    }

    // BJ_DEVS স্টাইল এনক্রিপ্ট
    const result = encryptLikeBJDEVS(code, size);

    return res.status(200).json({
      success: true,
      result: result,
      stats: {
        originalSize: code.length,
        newSize: result.length,
        sizeInMB: (result.length / (1024 * 1024)).toFixed(2),
        increasedBy: ((result.length / code.length) * 100).toFixed(0) + 'x'
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// ========== BJ_DEVS স্টাইল এনক্রিপ্টর ==========
function encryptLikeBJDEVS(originalCode, sizeMB = 5) {
  
  // 1. আসল কোডকে বেস64 করুন
  const base64 = Buffer.from(originalCode).toString('base64');
  
  // 2. ইউনিকোড ম্যাপ (জাপানি/চাইনিজ ক্যারেক্টার)
  const charMap = {
    'A': '亜', 'B': '唖', 'C': '娃', 'D': '阿', 'E': '哀',
    'F': '愛', 'G': '挨', 'H': '姶', 'I': '逢', 'J': '葵',
    'K': '茜', 'L': '穐', 'M': '悪', 'N': '握', 'O': '渥',
    'P': '旭', 'Q': '葦', 'R': '芦', 'S': '鯵', 'T': '梓',
    'U': '圧', 'V': '斡', 'W': '扱', 'X': '宛', 'Y': '姐',
    'Z': '虻', 'a': '亜', 'b': '唖', 'c': '娃', 'd': '阿',
    'e': '哀', 'f': '愛', 'g': '挨', 'h': '姶', 'i': '逢',
    'j': '葵', 'k': '茜', 'l': '穐', 'm': '悪', 'n': '握',
    'o': '渥', 'p': '旭', 'q': '葦', 'r': '芦', 's': '鯵',
    't': '梓', 'u': '圧', 'v': '斡', 'w': '扱', 'x': '宛',
    'y': '姐', 'z': '虻', '0': '0', '1': '1', '2': '2',
    '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
    '8': '8', '9': '9', '+': '加', '/': '除', '=': '等'
  };
  
  // 3. বেস64 কে ইউনিকোডে কনভার্ট
  let encrypted = '';
  for (let char of base64) {
    encrypted += charMap[char] || char;
  }
  
  // 4. রিভার্স ম্যাপ (ডিকোডারের জন্য)
  const reverseMap = {};
  for (let [key, value] of Object.entries(charMap)) {
    reverseMap[value] = key;
  }
  
  // 5. ডিকোডার ফাংশন তৈরি
  const decoderFunction = `
  (function(){
    // ===== ডিকোডার ম্যাপ =====
    const _map = ${JSON.stringify(reverseMap)};
    
    // ===== এনক্রিপ্টেড ডেটা =====
    const _data = "${encrypted}";
    
    // ===== ডিকোড =====
    let _decoded = '';
    for(let i=0; i<_data.length; i++) {
      _decoded += _map[_data[i]] || _data[i];
    }
    
    // ===== বেস64 ডিকোড =====
    const _html = atob(_decoded);
    
    // ===== ইঞ্জেক্ট =====
    document.open();
    document.write(_html);
    document.close();
  })();
  `;
  
  // 6. ডামি ডেটা যোগ (সাইজ বাড়ানোর জন্য)
  const dummyData = generateDummyData(sizeMB);
  const padding = generatePadding(sizeMB);
  
  // 7. ফাইনাল আউটপুট
  let final = `
  <!-- Encrypted By Web Protector -->
  <script>
  ${dummyData}
  ${decoderFunction}
  ${padding}
  <\/script>
  `;
  
  // 8. মিনিফাই
  final = final.replace(/\s+/g, ' ').trim();
  
  return final;
}

// ========== ডামি ডেটা ==========
function generateDummyData(sizeMB) {
  let dummy = '';
  
  // ডামি ভেরিয়েবল (আকার বাড়ানোর জন্য)
  for (let i = 0; i < 100; i++) {
    dummy += `var _d${i} = "${'X'.repeat(1000)}";\n`;
  }
  
  // ডামি অ্যারে
  dummy += `var _arr = [${'0,'.repeat(10000)}];\n`;
  
  // ডামি ফাংশন
  for (let i = 0; i < 50; i++) {
    dummy += `function _f${i}(){ return "${'A'.repeat(500)}"; }\n`;
  }
  
  // বড় কমেন্ট
  dummy += `/* ${'Z'.repeat(sizeMB * 1024 * 80)} */\n`;
  
  return dummy;
}

// ========== প্যাডিং ==========
function generatePadding(sizeMB) {
  return `/* ${'P'.repeat(sizeMB * 1024 * 10)} */\n`;
    }
