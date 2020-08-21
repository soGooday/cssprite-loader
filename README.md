# 说明 
🌕当前是一个简单的雪碧图的 loader.

✨测试文档地址：https://github.com/soGooday/test-cssprite-loader 

## 🤪Getting Started

To begin, you'll need to install <code>cssprite-loader</code>:

```shell
npm install --save-dev cssprite-loader
```

此loader依赖于spritesmith，所以记得安装
```shell
npm install --save-dev spritesmith
```


#### ☃️合并实例
##### png类型
![png类型](https://github.com/soGooday/test-cssprite-loader/blob/master/quoteImage/sp_3.png "png类型")
##### jpg类型
![jpg类型](https://github.com/soGooday/test-cssprite-loader/blob/master/quoteImage/sp_4.png "jpg类型")

## 使用方法

#### 🔨loader 配置
```js
module:{
    rules:[{
        test:/\.scss\$/,
        exclude: /node_modules/, 
        use:[{
                loader: 'style-loader',
            },{
                loader:'css-loader',
            },{
                loader: 'cssprite-loader',//放在要比css-loader先一步执行的位置
				options: {
                    filename: "cssprite", //需要存放的雪碧图的文件名称CSS Sprites
                    padding: 2,//每张素材的间隙
                    algorithm: 'binary-tree',//打成雪碧图的算法 🏳️‍🌈layout
                    imgType: ['png', 'jpg', 'jpeg'],//能够打成雪碧图的素材类型 直接使用作为正则的匹配
                    htmlFontSize:20,//html的font-size值是多少  用于rem的适配
                    imageRatio:2,//使用的是几倍图的素材
                    defaultType:'png',//不同类型图片被打包成为同一张雪碧图,此时被合成的雪碧图类型。建议png
                }
        	},{
                loader: 'sass-loader',//泛指css预编译器 可有可无
        }],
    }]  
}
``` 
#### 💥建议！！  
##### 👀建议在file-loader，或者是url-loader中导出的图片的素材为添加hash值，这样可以处理浏览器本次开发缓存的问题。
##### 👀如果你并不打算折磨做，可以在处理全部或者部分阶段处理完毕后，添加上雪碧图的标志后。然后从新开启本地服务
##### ⚠️不同类型图片被打包成为同一张雪碧图,此时被合成的雪碧图时，此雪碧图的类型默认是 defaultType中设置的参数。默认是 png
## 🏳️‍🌈layout 
🤷top-down:       上-下
🤷🏻left-right:     左-右
🤷🏼diagonal:       对角线
🤷🏽alt-diagonal:   对角线居中
🤷🏾binary-tree:    居中  

🚄More information can be found in the layout documentation:
[layout](https://github.com/twolfson/layout)➡️https://github.com/twolfson/layout


## 🔨css中的使用
⚠️⚠️⚠️目前需要注意的是css要跟images在同级目录下。不可以越级。否则会报错找不到相关素材。（当前版本还在升级中。后续会处理掉这个问题）
我们需要在 index.css 中引用 images 中的图片
```css
    .image1{
        width:100px,
        height:100px,
        background-image: url(./images/a.png?sp_1);
    }
    .image2{
        width:100px,
        height:100px,
        background-image: url(./images/d.png?sp_1);
    }
    .image3{
        width:100px,
        height:100px,
        background-image: url(./images/b.jpg?sp_2);
    }
    .image4{
        width:100px,
        height:100px,
        background-image: url(./images/c.jpg?sp_2);
    }
```
#### ⚠️需要注意的是
🌘其中的?是标识符,通过?与指定的文件类型进行适配。找到到?切?之后携带的文本，作为雪碧图的名字。如上会创建两个雪碧图
🌗雪碧图sp_1：d.png与a.png组成，
🌖雪碧图sp_2：d.png与a.png组成，
🌕雪碧图会被放在cssprite文件夹下，最后图片的打包交给图片相关的loader处理就好


