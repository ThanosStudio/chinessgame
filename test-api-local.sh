#!/bin/bash

# 本地测试 API 的脚本

echo "=========================================="
echo "Testing Local API"
echo "=========================================="
echo ""

# 检查开发服务器是否运行
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Development server is not running!"
    echo "   Please run: npm run dev"
    exit 1
fi

echo "✓ Development server is running"
echo ""

# 测试 API
echo "Testing /api/challenge endpoint..."
echo ""

RESPONSE=$(curl -s "http://localhost:3000/api/challenge?t=$(date +%s)" \
  -H "Cache-Control: no-cache" \
  -H "Pragma: no-cache")

# 检查响应
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✓ API returned success"
    
    # 检查是否是默认挑战
    if echo "$RESPONSE" | grep -q "拆解汉字：'明'"; then
        echo "⚠️  Warning: API returned default challenge"
        echo "   This means Gemini API call likely failed"
        echo ""
        echo "Response preview:"
        echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -15 || echo "$RESPONSE" | head -5
    else
        echo "✓ API returned generated challenge (not default)"
        echo ""
        echo "Response preview:"
        echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -20 || echo "$RESPONSE" | head -5
    fi
else
    echo "❌ API returned error"
    echo ""
    echo "Response:"
    echo "$RESPONSE"
fi

echo ""
echo "=========================================="
echo "Check the terminal running 'npm run dev'"
echo "for detailed logs from the API route"
echo "=========================================="

