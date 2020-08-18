# 说明

当前是一个简单的雪碧图的 loader.


## Getting Started

To begin, you'll need to install <code>cssprite-loader</code>:

```shell
npm install --save-dev cssprite-loader
```

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
                loader: 'css-loader',
				    options: {
                    filename: "imageSprite", //,//需要存放的雪碧图的文件名称CSS Sprites 
                    padding: 2,//每张素材的间隙
                    algorithm: 'binary-tree',//计算方法 性能最佳
                    imgType: ['png', 'jpg', 'jpeg'],//能够打成雪碧图的素材类型 直接使用作为正则的匹配 防止出现对其他资源引用连接上带?
                }
        	},{
                loader: 'sass-loader'
        }],
    }]  
}
```
假设结构目录为
| root |
| ---- | src |
| ---- | --- | images |
| ---- | --- | images | a.png,b.jpg,c.jpg,d.png,e.jpeg |
| ---- | --- | index.css |

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

