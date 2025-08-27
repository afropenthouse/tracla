import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ Gemini API key not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gemini API not configured',
          details: 'Please set GEMINI_API_KEY environment variable'
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

    console.log('🧠 Processing receipt with Gemini 2.5 Flash...');

    // Get Gemini model (Flash for speed and accuracy)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Craft intelligent prompt for receipt analysis
    const prompt = `
You are an expert receipt analysis AI. Analyze this receipt image and extract key information with high accuracy.

Please examine the receipt carefully and extract the following information:

1. **Total Amount**: The final amount paid (not subtotal, not individual items)
2. **Date and Time**: When the purchase was made
3. **Merchant Information**: Store/business name and location if available
4. **Additional Details**: Any other relevant information (tax, payment method, etc.)

Return the information in this exact JSON format:
{
  "amount": [numerical value only, no currency symbols],
  "currency": "[currency code like NGN, USD, etc.]",
  "dateTime": {
    "date": "[date in readable format]",
    "time": "[time if available]"
  },
  "merchant": {
    "name": "[store name]",
    "address": "[address if visible]"
  },
  "tax": "[tax amount if visible]",
  "paymentMethod": "[payment method if visible]",
  "confidence": [confidence score 0-100],
  "insights": "[brief note about what you found]"
}

Important guidelines:
- Be very careful to identify the TOTAL amount, not subtotal or individual item prices
- Look for keywords like "TOTAL", "AMOUNT DUE", "BALANCE", "GRAND TOTAL"
- If multiple amounts exist, choose the final amount paid
- Use common sense to identify what's most likely the total
- Return null for any field you cannot confidently identify
- Be honest about confidence levels

Analyze the receipt now:`;

    // Convert base64 image for Gemini
    const imagePart = {
      inlineData: {
        data: image,
        mimeType: "image/jpeg"
      }
    };

    console.log('🤖 Sending prompt to Gemini...');

    // Generate content with image and prompt
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log('📄 Gemini raw response length:', text.length);
    console.log('🧠 Gemini response preview:', text.substring(0, 200) + '...');

    // Parse JSON response from Gemini
    let extractedData;
    try {
      // Clean up the response - remove markdown formatting if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extractedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini JSON response:', parseError);
      console.log('Raw response:', text);
      
      // Fallback: Try to extract key information manually
      const amount = text.match(/amount["\s:]*(\d+(?:\.\d{2})?)/i);
      const currency = text.match(/currency["\s:]*["']?([A-Z]{3})["']?/i);
      const date = text.match(/date["\s:]*["']?([^"'\n]+)["']?/i);
      
      extractedData = {
        amount: amount ? parseFloat(amount[1]) : null,
        currency: currency ? currency[1] : 'NGN',
        dateTime: date ? { date: date[1], time: null } : null,
        merchant: null,
        confidence: 60,
        insights: 'Partial extraction due to response format issues',
        rawResponse: text
      };
    }

    // Validate and enhance the extracted data
    const validatedData = {
      amount: extractedData.amount && !isNaN(extractedData.amount) ? extractedData.amount : null,
      currency: extractedData.currency || 'NGN',
      dateTime: extractedData.dateTime || null,
      merchant: extractedData.merchant || null,
      tax: extractedData.tax || null,
      paymentMethod: extractedData.paymentMethod || null,
      confidence: extractedData.confidence || 95,
      insights: extractedData.insights || 'Receipt analyzed successfully',
      processingMethod: 'Gemini 2.5 Flash',
      rawResponse: text
    };

    console.log('✅ Gemini processing complete');
    console.log('💰 Extracted amount:', validatedData.amount);
    console.log('📅 Extracted date:', validatedData.dateTime?.date);
    console.log('🏪 Extracted merchant:', validatedData.merchant?.name);
    console.log('🎯 Confidence:', validatedData.confidence + '%');

    return NextResponse.json({
      success: true,
      data: validatedData
    });

  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    
    // More specific error handling
    let errorMessage = 'Failed to process image with Gemini';
    let statusCode = 500;
    
    if (error.message.includes('API key')) {
      errorMessage = 'Invalid Gemini API key';
      statusCode = 401;
    } else if (error.message.includes('quota')) {
      errorMessage = 'Gemini API quota exceeded';
      statusCode = 429;
    } else if (error.message.includes('image')) {
      errorMessage = 'Invalid image format for Gemini';
      statusCode = 400;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error.message 
      },
      { status: statusCode }
    );
  }
}  