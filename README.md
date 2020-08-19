# 说明

当前是一个简单的雪碧图的 loader.


## Getting Started

To begin, you'll need to install <code>cssprite-loader</code>:

```shell
npm install --save-dev cssprite-loader
```

#### 合并实例
![合并实例](https://github.com/soGooday/test-cssprite-loader/blob/master/quoteImage/sp_3.png "合并实例")

## 使用方法

#### loader 配置
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
                loader: 'cssprite-loader',
				options: {
                    filename: "cssprite", //需要存放的雪碧图的文件名称CSS Sprites
                    padding: 2,//每张素材的间隙
                    algorithm: 'binary-tree',//计算方法 性能最佳
                    imgType: ['png', 'jpg', 'jpeg'],//能够打成雪碧图的素材类型 直接使用作为正则的匹配
                    htmlFontSize:20,//html的font-size值是多少  用于rem的适配
                    imageRatio:2,//使用的是几倍图的素材
                }
        	},{
                loader: 'sass-loader'
        }],
    }]  
}
``` 
#### 建议！！  
##### 我们建议在file-loader，或者是url-loader中导出的图片的素材为添加hash值，这样可以处理浏览器本次开发缓存的问题 

## layout 

| top-down | left-right | diagonal | alt-diagonal | binary-tree |
| --------------------------------------------------------------|
|   上-下  |    左-右   |  对角线  |  对角线居中   |     居中    |
  

More information can be found in the layout documentation:

https://github.com/twolfson/layout

## css中的使用
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
其中的?是标识符,通过?与指定的文件类型进行适配。找到到?切?之后携带的文本，作为雪碧图的名字。如上会创建两个雪碧图
雪碧图sp_1：d.png与a.png组成
雪碧图sp_2：d.png与a.png组成
雪碧图会被放在cssprite文件夹下


