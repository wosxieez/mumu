/**
 * ui方面的
 *  比如文本
 * Created by Administrator on 2014/7/2.
 */
var ui = {};

ui.DEFAULT_TTF_FONT      = "Arial"
ui.DEFAULT_TTF_FONT_SIZE = 24

ui.TEXT_ALIGN_LEFT    = cc.TEXT_ALIGNMENT_LEFT
ui.TEXT_ALIGN_CENTER  = cc.TEXT_ALIGNMENT_CENTER
ui.TEXT_ALIGN_RIGHT   = cc.TEXT_ALIGNMENT_RIGHT
ui.TEXT_VALIGN_TOP    = cc.VERTICAL_TEXT_ALIGNMENT_TOP
ui.TEXT_VALIGN_CENTER = cc.VERTICAL_TEXT_ALIGNMENT_CENTER
ui.TEXT_VALIGN_BOTTOM = cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM


/**
    使用 TTF 字体创建文字显示对象，并返回 LabelTTF 对象。
可用参数：
-    text: 要显示的文本
-    font: 字体名，如果是非系统自带的 TTF 字体，那么指定为字体文件名
-    size: 文字尺寸，因为是 TTF 字体，所以可以任意指定尺寸
-    color: 文字颜色（可选），用 cc.c3b() 指定，默认为白色
-    align: 文字的水平对齐方式（可选）
-    valign: 文字的垂直对齐方式（可选），仅在指定了 dimensions 参数时有效
-    dimensions: 文字显示对象的尺寸（可选），使用 cc.size() 指定
-    x, y: 坐标（可选）

align 和 valign 参数可用的值：

-    ui.TEXT_ALIGN_LEFT 左对齐
-    ui.TEXT_ALIGN_CENTER 水平居中对齐
-    ui.TEXT_ALIGN_RIGHT 右对齐
-    ui.TEXT_VALIGN_TOP 垂直顶部对齐
-    ui.TEXT_VALIGN_CENTER 垂直居中对齐
-    ui.TEXT_VALIGN_BOTTOM 垂直底部对齐

-- 创建一个居中对齐的文字显示对象
var label = ui.newTTFLabel({
    text : "Hello, World",
    font : "Marker Felt",
    size : 64,
    align : ui.TEXT_ALIGN_CENTER // 文字内部居中对齐
    })

-- 左对齐，并且多行文字顶部对齐
 var label = ui.newTTFLabel({
    text : "Hello, World\n您好，世界",
    font : "Arial",
    size : 64,
    color : cc.color(255, 0, 0, 128),
    align : ui.TEXT_ALIGN_LEFT,
    valign : ui.TEXT_VALIGN_TOP,
    dimensions : cc.size(400, 200)
});
 this.addChild(label);
    @param table params 参数表格对象

@return LabelTTF LabelTTF对象
**/
ui.newTTFLabel = function(params){
    var text       = tostring(params.text)
    var font       = params.font || this.DEFAULT_TTF_FONT
    var size       = params.size || this.DEFAULT_TTF_FONT_SIZE
    var color      = params.color || display.COLOR_WHITE
    var textAlign  = params.align || this.TEXT_ALIGN_LEFT
    var textValign = params.valign || this.TEXT_VALIGN_CENTER
    var x       = params.x;
    var y       = params.y
    var dimensions = params.dimensions

    var label
    if (dimensions)
        label = cc.LabelTTF.create(text, font, size, dimensions, textAlign, textValign)
    else
        label = cc.LabelTTF.create(text, font, size)


    if(label)
        label.setColor(color)

    label.realign=function(x, y){
        if(textAlign == this.TEXT_ALIGN_LEFT)
            label.setPosition(math.round(x + label.getContentSize().width / 2), y)
        else if( textAlign == this.TEXT_ALIGN_RIGHT)
            label.setPosition(x - math.round(label.getContentSize().width / 2), y)
        else
            label.setPosition(x, y)
    }

    if( x && y) label.realign(x, y)
    return label
}




/**
    用位图字体创建文本显示对象，并返回 LabelBMFont 对象。
BMFont 通常用于显示英文内容，因为英文字母加数字和常用符号也不多，生成的 BMFont 文件较小。如果是中文，应该用 TTFLabel。
可用参数：
-    text: 要显示的文本
-    font: 字体文件名
-    align: 文字的水平对齐方式（可选）
-    x, y: 坐标（可选）
var label = ui.newBMFontLabel({
    text : "Hello",
    font : "UIFont.fnt",
    })
    @param table params 参数表格对象
@return LabelBMFont LabelBMFont对象
**/
ui.newBMFontLabel=function(params){
    var text      = tostring(params.text)
    var font      = params.font
    //如果params.align 为false,即 textAlign = ui.TEXT_ALIGN_CENTER，否则textAlign = params.align
    var textAlign = params.align || ui.TEXT_ALIGN_CENTER
    var x   = params.x;
    var y   = params.y;

    var label = cc.LabelBMFont.create(text, font, cc.LABEL_AUTOMATIC_WIDTH, textAlign)
    if(label)
        return

    if(type(x) == "number" && type(y) == "number")//判断x,y是不是number类型
        label.setPosition(x, y)


    if(textAlign == ui.TEXT_ALIGN_LEFT)
        label.align(display.LEFT_CENTER)
    else if( textAlign == ui.TEXT_ALIGN_RIGHT)
        label.align(display.RIGHT_CENTER)
    else
        label.align(display.CENTER)


    return label
}