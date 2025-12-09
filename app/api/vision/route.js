import { NextResponse } from 'next/server';
import vision from '@google-cloud/vision';

// Initialize Google Vision client
let client;

try {
  // Try using keyFilename first
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }
  // Fallback: Use service account key from environment variable
  else if (process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY) {
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY);
    client = new vision.ImageAnnotatorClient({
      credentials: credentials,
      projectId: credentials.project_id,
    });
  }
  else {
    throw new Error('No Google Cloud credentials configured');
  }
} catch (error) {
  console.error('❌ Google Vision client initialization failed:', error.message);
}

// Enhanced receipt parsing functions
const parseAmount = (text) => {
  const lines = text.split('\n').map(line => line.trim());
  
  // Priority 1: Explicit total keywords (highest priority)
  const totalPatterns = [
    /(?:^|\s)total[:\s]*\$?(\d+\.\d{2})(?:\s|$)/gi,
    /(?:^|\s)amount\s+due[:\s]*\$?(\d+\.\d{2})(?:\s|$)/gi,
    /(?:^|\s)balance\s+due[:\s]*\$?(\d+\.\d{2})(?:\s|$)/gi,
    /(?:^|\s)grand\s+total[:\s]*\$?(\d+\.\d{2})(?:\s|$)/gi,
    /(?:^|\s)final\s+total[:\s]*\$?(\d+\.\d{2})(?:\s|$)/gi,
  ];

  // Check each line for high-priority total patterns
  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        const amount = parseFloat(match[1]);
        if (!isNaN(amount) && amount > 0 && amount < 100000) {
          console.log(`🎯 AI Found TOTAL: ${amount} from line: "${line}"`);
          return { amount, confidence: 95 };
        }
      }
    }
  }

  // Priority 2: Currency format amounts in bottom section
  const bottomHalf = lines.slice(Math.floor(lines.length / 2));
  const currencyPatterns = [
    /\$(\d+\.\d{2})(?:\s|$)/g,
    /₦(\d+\.\d{2})(?:\s|$)/g,
    /(\d+\.\d{2})(?:\s|$)/g
  ];

  const bottomAmounts = [];
  for (const line of bottomHalf) {
    // Skip reference numbers, terminal IDs, etc.
    if (/(?:ref|terminal|account|approval|tch|auth)\s*#?\s*\d+/gi.test(line)) {
      continue;
    }
    
    for (const pattern of currencyPatterns) {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        const amount = parseFloat(match[1]);
        if (!isNaN(amount) && amount > 0 && amount < 100000) {
          bottomAmounts.push({
            amount,
            line: line,
            confidence: line.toLowerCase().includes('total') ? 90 : 
                       line.toLowerCase().includes('subtotal') ? 75 : 60
          });
        }
      }
    }
  }

  if (bottomAmounts.length > 0) {
    const bestMatch = bottomAmounts.sort((a, b) => b.confidence - a.confidence)[0];
    console.log(`💰 AI Found amount: ${bestMatch.amount} (${bestMatch.confidence}% confidence)`);
    return { amount: bestMatch.amount, confidence: bestMatch.confidence };
  }

  return null;
};

const parseDateTime = (text) => {
  const datePatterns = [
    // DD/MM/YYYY HH:MM
    /(\d{1,2}\/\d{1,2}\/\d{4})\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)?/g,
    // DD-MM-YYYY HH:MM
    /(\d{1,2}-\d{1,2}-\d{4})\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)?/g,
    // YYYY/MM/DD HH:MM
    /(\d{4}\/\d{1,2}\/\d{1,2})\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)?/g,
    // Month DD, YYYY
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})/gi,
    // Time only patterns
    /(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)/g,
  ];

  const results = [];
  
  datePatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[0]) {
        results.push({
          full: match[0],
          date: match[1] || match[0],
          time: match[2] || null,
          confidence: 85
        });
      }
    }
  });

  return results.length > 0 ? results[0] : null;
};

const parseMerchant = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Usually merchant name is in the first few lines
  const topLines = lines.slice(0, 5);
  
  // Look for store patterns
  const storePatterns = [
    /^([A-Z][A-Z\s\-&]+)$/,  // All caps store names
    /^(.+(?:STORE|MART|SHOP|MARKET|CENTER|RESTAURANT|CAFE).*?)$/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*$/
  ];
  
  for (const line of topLines) {
    // Skip phone numbers, addresses with numbers
    if (/^\d+|\(\d+\)|\d{3}-\d{3}/.test(line)) continue;
    
    for (const pattern of storePatterns) {
      const match = line.match(pattern);
      if (match && match[1] && match[1].length > 2) {
        const merchantName = match[1].trim();
        
        // Look for address in subsequent lines
        let address = null;
        const addressIndex = lines.indexOf(line) + 1;
        if (addressIndex < lines.length) {
          const nextLines = lines.slice(addressIndex, addressIndex + 3);
          for (const addrLine of nextLines) {
            if (/\d+.*(?:ST|STREET|AVE|AVENUE|RD|ROAD|BLVD|BOULEVARD|WAY|LANE|DR|DRIVE)/i.test(addrLine)) {
              address = addrLine;
              break;
            }
          }
        }
        
        console.log(`🏪 AI Found merchant: ${merchantName}${address ? ` at ${address}` : ''}`);
        return {
          name: merchantName,
          address: address,
          confidence: 80
        };
      }
    }
  }
  
  return null;
};

const parseLineItems = (text) => {
  const lines = text.split('\n').map(line => line.trim());
  const items = [];
  
  // Look for item patterns: ITEM NAME PRICE
  const itemPattern = /^([A-Z\s&\-]+?)\s+(\d+\.\d{2})(?:\s|$)/;
  
  for (const line of lines) {
    // Skip total lines, header lines
    if (/total|subtotal|tax|change|tender|account|ref/gi.test(line)) continue;
    if (line.length < 5) continue;
    
    const match = line.match(itemPattern);
    if (match) {
      const name = match[1].trim();
      const price = parseFloat(match[2]);
      
      if (name.length > 2 && price > 0 && price < 10000) {
        items.push({
          name: name,
          price: price,
          confidence: 70
        });
      }
    }
  }
  
  console.log(`🛒 AI Found ${items.length} line items`);
  return items.length > 0 ? items : null;
};

const parseTaxInfo = (text) => {
  const lines = text.split('\n').map(line => line.trim());
  let subtotal = null;
  let taxAmount = null;
  
  for (const line of lines) {
    // Look for subtotal
    const subtotalMatch = line.match(/subtotal[:\s]*\$?(\d+\.\d{2})/gi);
    if (subtotalMatch) {
      subtotal = parseFloat(subtotalMatch[0].match(/(\d+\.\d{2})/)[1]);
    }
    
    // Look for tax
    const taxMatch = line.match(/(?:tax|th\s*\d*)[:\s]*\$?(\d+\.\d{2})/gi);
    if (taxMatch) {
      const tax = parseFloat(taxMatch[0].match(/(\d+\.\d{2})/)[1]);
      taxAmount = (taxAmount || 0) + tax;
    }
  }
  
  if (subtotal || taxAmount) {
    console.log(`💸 AI Found tax info - Subtotal: ${subtotal}, Tax: ${taxAmount}`);
    return {
      subtotal: subtotal,
      amount: taxAmount,
      confidence: 75
    };
  }
  
  return null;
};

const parsePaymentMethod = (text) => {
  const paymentPatterns = [
    /credit/gi,
    /debit/gi,
    /cash/gi,
    /card/gi,
    /visa/gi,
    /mastercard/gi,
    /amex/gi
  ];
  
  for (const pattern of paymentPatterns) {
    const match = text.match(pattern);
    if (match) {
      console.log(`💳 AI Found payment method: ${match[0]}`);
      return match[0].toUpperCase();
    }
  }
  
  return null;
};

export async function POST(request) {
  try {
    // Check if client is initialized
    if (!client) {
      console.error('❌ Google Vision client not initialized');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Google Vision API not configured',
          details: 'Check your GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY environment variable'
        },
        { status: 500 }
      );
    }

    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    console.log('🤖 Processing image with Google Vision API...');
    console.log('📁 Using credentials from:', process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'file' : 'environment variable');

    // Call Google Vision API
    const [result] = await client.textDetection({
      image: {
        content: image,
      },
    });

    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No text detected in image' },
        { status: 400 }
      );
    }

    // Get full text from first detection (contains all text)
    const fullText = detections[0].description;
    console.log('📄 Google Vision extracted text length:', fullText.length);

    // Parse extracted text with enhanced AI logic
    const amount = parseAmount(fullText);
    const dateTime = parseDateTime(fullText);
    const merchant = parseMerchant(fullText);
    const items = parseLineItems(fullText);
    const tax = parseTaxInfo(fullText);
    const paymentMethod = parsePaymentMethod(fullText);

    // Build response data
    const extractedData = {
      rawText: fullText,
      amount: amount?.amount || null,
      dateTime: dateTime ? {
        date: dateTime.date,
        time: dateTime.time,
        full: dateTime.full
      } : null,
      merchant: merchant,
      items: items,
      tax: tax,
      paymentMethod: paymentMethod,
      currency: '₦', // Default currency
      confidence: {
        amount: amount?.confidence || 0,
        dateTime: dateTime?.confidence || 0,
        merchant: merchant?.confidence || 0,
        overall: Math.round((
          (amount?.confidence || 0) + 
          (dateTime?.confidence || 0) + 
          (merchant?.confidence || 0)
        ) / 3)
      },
      processingMethod: 'Google Vision API',
      textDetections: detections.length
    };

    console.log('✅ AI processing complete');
    console.log('📊 Confidence scores:', extractedData.confidence);

    return NextResponse.json({
      success: true,
      data: extractedData
    });

  } catch (error) {
    console.error('❌ Google Vision API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process image with AI',
        details: error.message 
      },
      { status: 500 }
    );
  }
}