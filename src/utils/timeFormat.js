//封装一个获取时间的函数
 let timer = function getFormatTime(time, pattern) {
  let time1 = new Date(time);//这一步已经得到了具体的时间
  // console.log(time1);
  //下面是我们自己设定样式
  let y = time1.getFullYear();
  // console.log(y);
  //padStart(targetLength, padString)
  let M = (time1.getMonth() + 1 + '').padStart(2, '0');
  let d = (time1.getDate() + '');

  let h = (time1.getHours() + '').padStart(2, '0');
  let m = (time1.getMinutes() + '').padStart(2, '0');
  let s = (time1.getSeconds() + '').padStart(2, '0');

  // console.log(y,M,d,h,m,s);
  return `${y}-${M}-${d} ${h}:${m}:${s}`;
}

export default timer;

//在main页面导入并注册
