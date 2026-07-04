// api/encode.js - BJ_DEVS Exact Style
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

    const result = encryptBJDEVS(code, size);

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

// ========== BJ_DEVS Exact Style Encryptor ==========
function encryptBJDEVS(originalCode, sizeMB = 5) {
  
  // 1. আসল কোডকে বেস64 করুন
  const base64 = Buffer.from(originalCode).toString('base64');
  
  // 2. ইউনিকোড ম্যাপ (BJ_DEVS এর মতো)
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
  
  // 4. রিভার্স ম্যাপ
  const reverseMap = {};
  for (let [key, value] of Object.entries(charMap)) {
    reverseMap[value] = key;
  }
  
  // 5. ডামি ডেটা জেনারেট (BJ_DEVS স্টাইল)
  const dummyVars = generateDummyVars(sizeMB);
  const dummyComments = generateDummyComments(sizeMB);
  
  // 6. ডিকোডার তৈরি (BJ_DEVS এর মতো)
  const decoder = `
  <!-- Encryption By Web Protector -->
  <script>
  <!--
  ${dummyVars}
  
  var _encrypted = "${encrypted}";
  var _map = ${JSON.stringify(reverseMap)};
  
  // ডিকোড
  var _decoded = '';
  for(var i=0; i<_encrypted.length; i++) {
    _decoded += _map[_encrypted[i]] || _encrypted[i];
  }
  
  // বেস64 ডিকোড
  var _html = atob(_decoded);
  
  // রান
  document.write(_html);
  
  ${dummyComments}
  //-->
  </script>
  `;
  
  // 7. মিনিফাই
  let final = decoder.replace(/\s+/g, ' ').trim();
  
  return final;
}

// ========== ডামি ভেরিয়েবল ==========
function generateDummyVars(sizeMB) {
  let dummy = '';
  
  // ডামি ভেরিয়েবল (BJ_DEVS স্টাইল)
  const unicodeVars = ['唖', '娃', '宛', '斡', '姐', '哀', '愛', '挨', '姶', '逢', '葵', '茜', '穐', '悪', '握', '渥', '旭', '葦', '芦', '鯵', '梓', '圧', '扱', '虻'];
  
  for (let i = 0; i < 50; i++) {
    const varName = unicodeVars[i % unicodeVars.length] + unicodeVars[(i+1) % unicodeVars.length] + i;
    dummy += `var ${varName}="${'X'.repeat(100)}";\n`;
  }
  
  // ডামি অ্যারে
  dummy += `var _arr=[${'0,'.repeat(5000)}];\n`;
  
  // ডামি ফাংশন
  for (let i = 0; i < 30; i++) {
    dummy += `function _f${i}(){return "${'A'.repeat(200)}";}\n`;
  }
  
  return dummy;
}

// ========== ডামি কমেন্ট ==========
function generateDummyComments(sizeMB) {
  let dummy = '';
  
  // বড় কমেন্ট
  dummy += `<!-- ${'Z'.repeat(sizeMB * 1024 * 50)} -->\n`;
  
  // আরও কমেন্ট
  for (let i = 0; i < 20; i++) {
    dummy += `// ${'X'.repeat(1000)}\n`;
  }
  
  return dummy;
    }
