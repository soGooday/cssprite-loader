const Spritesmith = require('spritesmith');
const loaderUtils = require('loader-utils');
const fs = require('fs');
const path = require('path');
//默认的配置项
let config = {
    filename: "cssprite", //需要存放的雪碧图的文件名称CSS Sprites
    padding: 2,//每张素材的间隙
    algorithm: 'binary-tree',//计算方法 性能最佳
    imgType: ['png', 'jpg', 'jpeg'],//能够打成雪碧图的素材类型 直接使用作为正则的匹配
    htmlFontSize: 20,//html的font-size值是多少  用于rem的适配
    imageRatio: 2,//使用的是几倍图的素材
}
module.exports = function (source) {
    const callback = this.async();
    const options = Object.assign(config, loaderUtils.getOptions(this));//得到配置参数 
    // let imgType = `(${options.imgType.join("|")})` 
    //正则的意思是取到url(parameter)  parameter= .imgType?\w  .后面必须有图片类型中的一个且结尾必须是一个?结尾并在?后面有文本 多个?是不符合结果的
    // let imgRegExp = new RegExp(`url\\(\\S*?(?<=\.)(?:${imgType})(?:\\?\\S+)\\)`, 'gi') 
    let imgType = `(?:${options.imgType.join("|")})`
    let imgRegExp = new RegExp(`url\\(\\S+?\\.${imgType}\\?(?:\\w+)\\)`, 'gi')
    let imgArray = source.match(imgRegExp) || []; //取到所有的url(....)的string 没用就给空数组  
    // let imgArray = source.match(/url\((.*?)\)/g) || []; //取到所有的url(....)的string 没用就给空数组 
    options.pageDirPath = this.context;
    options.resourcePath = this.resourcePath;
    let imgURLArrey = getImgeuRL(imgArray, this.context);//得到所有的图片素材的路径
    // console.log('imgURLArrey---:',imgURLArrey)
    let imgMap = getNeedImaheMap(imgURLArrey);//雪碧图的名字作为key valuse= array(image of path)  
    //检测需要进行雪碧图的处理
    if (imgMap.size > 0) {
        circulation(imgMap, source, options, (_source) => {
            callback(null, _source)
        })
    } else {
        //不需要雪碧图的处理 直接返回css的文本
        callback(null, source)
    }
}
/**
 * 将所有的路径的的图片的路径储存起来
 * @param {Array} imgArray 
 */
function getImgeuRL(imgArray, resourcePath) {
    let imgURLArrey = [];
    // console.log('imgArray:',imgArray)
    for (let index = 0; index < imgArray.length; index++) {
        let itme = imgArray[index].match(/\((\S*?)\)/)[1];//从 url(./img/reward-btn-1-2.png?sp_1) 匹配出./img/reward-btn-1-2.png?sp_1
        let imgPath = path.normalize(path.join(resourcePath, itme));//将路径合并起来
        // console.log('path---:','\n',imgPath)
        imgURLArrey.push(imgPath)  ///将文件的绝对路径得到  D:\webpack\webpack-scripes\src\img\reward-btn-1-2.png
    }
    return imgURLArrey;
}
/**
 * 区分出来那些事需要进行打成雪碧图
 * @param {Array} imgURLArrey 
 */
function getNeedImaheMap(imgURLArrey) {
    let imgMap = new Map();//雪碧图的名字作为key valuse= array(image of path) 
    imgURLArrey.forEach((imgPath, index) => {
        let reg1 = /\?+/g;//检测是不是需要打包成为雪碧图  发现图片的路径中 ? 的情况下 
        let isTrue = reg1.test(imgPath)
        if (isTrue) {
            let spKey = imgPath.match(/\?(\w*)/)[1];//将这个 图片的路径取到
            // console.log('spKey:',spKey)
            imgPath = imgPath.split('?')[0]//将?及其后面的字符去掉
            imgMap = getimgMap(imgMap, spKey, imgPath)
        }
    });
    return imgMap
}
/**
 * 收集起来需要打包成雪碧图的map  key(string)雪碧图的名字  valuse(array）对应的是雪碧图的素材路径
 * @param {Map} imgMap 
 * @param {string} spKey 
 * @param {string} imgPath 
 */
function getimgMap(imgMap, spKey, imgPath) {
    let imgPathArray = [];
    if (imgMap.has(spKey) === false) {
        imgPathArray.push(imgPath);
    } else {
        imgPathArray = imgMap.get(spKey);
        imgPathArray.push(imgPath)
    }
    imgMap.set(spKey, imgPathArray);
    return imgMap;
}
/**
 * 将图片打成雪碧图  将css中文件中的图片url与background-size进行修改处理
 * @param {Array} imgURLArrey 
 * @param {string} imgSpriteName 
 * @param {string} source 
 * @param {object} options   这个里面存放一些设置 时从webpack.config.js文件中取到的 
 */
function buildSprites(imgURLArrey, imgSpriteName, source, options) {
    let { pageDirPath, filename } = options;
    let outputPathFilePath = path.join(pageDirPath, filename);//生成的文件雪碧图路径
    // console.log('imgURLArrey:\n', imgURLArrey,'\npath:',outputPathFilePath)
    return new Promise((resolve, reject) => {
        Spritesmith.run({
            src: imgURLArrey,
            padding: options.padding || 2, // 各各图片之间测间隙
            algorithm: options.algorithm || 'top-down'  //算法的方式是什么 top-down	left-right	diagonal alt-diagonal binary-tree
        }, (err, result) => {
            //创建一个文件夹
            fs.mkdir(outputPathFilePath, function (err) {
                //  if (err) { 
                //     console.log(err); 
                // }
                // console.log('当前的路径：__dirname::',result)
                // console.log('当前生成的路径是',path.join(process.cwd(),`dist/img/${imgSpriteName}.png`))
                // console.log('result::',result.coordinates) 
                var imgSpriteType= getSpType(result.coordinates,options);
                // var imgSpriteType = 'jpg'
                console.log(`素材:${imgSpriteName}被打包成为${imgSpriteType}类型`)
                // console.log('---------------1----------------:',imgSpriteNamekey)
                // delFile(outputPathFilePath,new RegExp(`${imgSpriteNamekey}`,'g'),()=>{
                // console.log('---------------1----------------')
                fs.writeFile(path.join(outputPathFilePath, `/${imgSpriteName}.${imgSpriteType}`), result.image, function (err, info) {
                    let _source = changeCss(source, result, imgSpriteName, options, pageDirPath,imgSpriteType);
                    resolve(_source);
                });
                // });  
            })
        })
    })
}
/**
//  * 当前的所用仅仅是修改css文本 1将url()改为url(雪碧图); background-position:numpx numpx   将background-size：cover改为 background-size：雪碧图的宽与高
 * @param {string} source css的文本
 * @param {object} SpriteImageInfo 打包后的雪碧图的信息
 * @param {string} imgSpriteName 打包后的雪碧图的信息
 * @param {object} options 关闭雪碧图的相关参数
 * @param {string } pageDirPath 雪碧图被打包的路径文件夹
 * @param {string } imgSpriteType 雪碧图的被打包之后的类型
 */
function changeCss(source, SpriteImageInfo, imgSpriteName, options, pageDirPath,imgSpriteType) {
    // console.log('--------------------')
    let regExp2 = /\{(.*?)\}/gs; //用于取到{}中的内容
    let imgSpriteNamekey = getSpName(imgSpriteName);
    //得到{}中的内容
    source = source.replace(regExp2, (itme) => {
        let regExp = 'url\\(.*?' + imgSpriteNamekey + '\\)';//去配出相应的图片的url 
        let findRegExp = new RegExp(regExp, 'g')
        //检测有没有指定的雪碧图的名字 就直接返回
        if (findRegExp.test(itme) === false) {
            return itme
        } else {
            let ishavaBZ = /background\-size:.*?([;|}])/gis;//用于检测background-size的存在 
            let ishavsBG = /background\-image/g;//得到 background-image 改为background
            // let ishavsBR = /background\-repeat:.*?([;|}])/gis;
            let { filename, htmlFontSize, imageRatio } = options;
            let imageRatioNum = htmlFontSize * imageRatio;//计算出来最终的数值是多少 用于rem转化
            //当前的itme是{}中的内容 是有rul的链接的 证明是使用了图片的素材了
            // if(isHaveUrl.test(itme)){
            let getUrlContent = /\((\S*?)\)/g;//得到url中的内容 
            //在下面程序中    url()改为url(雪碧图) numpx numpx
            itme = itme.replace(getUrlContent, () => {
                //当前的url为的内容为  (image/Gold01@2x.png?sp_1) 所以返回的格式应该是 (image/Gold01@2x.png)
                //RegExp.$1为 image/Gold01@2x.png?sp_1  
                let url = RegExp.$1.split('?')[0];//得到 image/Gold01@2x.png  
                let p = path.join(pageDirPath, url); //将文件的绝对路径得到  D:\webpack\webpack-scripes\src\image\Gold01@2x.png 
                let info = SpriteImageInfo.coordinates[p]; //从对象中得到相应的信息 {D:\webpack\webpack-scripes\src\image\Gold01@2x.png:{ x: 0, y: 0, width: 321, height: 83 },...}
                // console.log(SpriteImageInfo.coordinates,'\n key:',p,'\n itme:',itme,'\n pageDirPath:',pageDirPath)
                // let string = `(./${filename}/${imgSpriteName}.png); \r\n  background-positon:${info.x/40}rem -${info.y/40}rem` 
                let string = `(./${filename}/${imgSpriteName}.${imgSpriteType}) -${info.x / imageRatioNum}rem -${info.y / imageRatioNum}rem;  background-repeat: no-repeat;`
                return string;//所以返回的格式应该是 (image/Gold01@2x.png) 
                // return string
            })
            //更改background-image 为background
            if (ishavsBG.test(itme)) {
                itme = itme.replace(ishavsBG, () => {
                    return ` background`
                })
            }
            //将
            if (ishavaBZ.test(itme)) {
                itme = itme.replace(ishavaBZ, () => {
                    let bigImage = SpriteImageInfo.properties
                    return ` background-size: ${bigImage.width / imageRatioNum}rem ${bigImage.height / imageRatioNum}rem${RegExp.$1}`
                })
            } else {
                //这边是没用background-size的代码，我们可以添加上
                itme = itme.split('}')[0];
                let bigImage = SpriteImageInfo.properties
                itme = itme + `;background-size: ${bigImage.width / imageRatioNum}rem ${bigImage.height / imageRatioNum}rem}`;
                // console.log('no have itme')
            }
            return itme;
        }
        //  console.log('itme222222:',itme) 
    })
    return source
}

/**
 * 通过回调使得每次 修改的css文本是同一个文本
 * @param {Map} imgMap 
 * @param {string} source 
 * @param {object} options 
 * @param {function} callBack 
 */
function circulation(imgMap, source, options, callBack) {
    let imgArry = mapToArray(imgMap);
    let index = 0;
    // console.log('imgArry:',imgArry)
    /**
     * 开始构建相关的 
     * @param {array} _imgArry 
     * @param {string} imgSpName 
     * @param {string} source 
     */
    function build(_imgArry, imgSpName, source, _options) {
        buildSprites(_imgArry, imgSpName, source, _options).then(resolve => {
            index++;
            if (index >= imgArry.length) {
                if (callBack) {
                    callBack(resolve)
                }
                return
            }
            build(imgArry[index][1], imgArry[index][0], resolve, _options)

        })
    }
    build(imgArry[index][1], imgArry[index][0], source, options)
}
/**
 * 将map 转化为数组
 * @param {Map} imgMap 
 */
function mapToArray(imgMap) {
    var list = [];
    for (var [key, value] of imgMap) {
        let keySp = `${key}`;//给雪碧图添加上唯一标识  为了处理的是在本地开发雪碧图的时候 雪碧图被缓存而不被更新
        // let keySp = `${key}.${(new Date).getTime()}`;//给雪碧图添加上唯一标识  为了处理的是在本地开发雪碧图的时候 雪碧图被缓存而不被更新
        // console.log(`对雪碧图的修改:${key}.${(new Date).getTime()}`)
        list.push([keySp, value]);
    }
    return list;
}
/***
 * 得到雪碧图的名字 去除唯一标识 
 * @param {Map} imgMap 
 */
function getSpName(SpName) {
    return SpName = SpName.split('.')[0]
}
/**
 * 取到当前的图片的类型 -目的要根据被打包的图片的类型。生成相应的雪碧图
 * @param {object} imageInfo 打成雪碧图之后的图片信息集合
 * @param {object} options 用户的loader配置项
 */
function getSpType(SpName,options) {
    let path = Object.keys(SpName)[0]; 
    let info = path.match(new RegExp(`(${options.imgType.join("|")})`));
    let spType = info[0] 
    return spType
}
/**
 * 删除同样的雪碧图的素材--不在使用此方式 使用hash值进行处理
 * @param {*} path 必传参数可以是文件夹可以是文件
 * @param {RegExp} regExp 要匹配的规则
 * @param {function} callBack 回调函数
 */
function delFile(path, regExp, callBack) {
    if (fs.existsSync(path)) {
        if (fs.statSync(path).isDirectory()) {
            let files = fs.readdirSync(path);
            files.forEach((file, index) => {
                // console.log('----------:',index)
                if (regExp.test(file)) {
                    console.log('找到的要删除的雪碧图:', file);
                    let currentPath = path + "/" + file;
                    if (fs.statSync(currentPath).isDirectory()) {
                        delFile(currentPath);
                    } else {
                        // console.log('要删除的是文件,而非文件夹')
                        fs.unlinkSync(currentPath);
                    }
                }
            });
            callBack();
        } else {
            callBack();
        }
    } else {
        callBack();
    }
}
