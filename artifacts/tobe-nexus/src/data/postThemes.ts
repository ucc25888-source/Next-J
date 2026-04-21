import { PostType } from '@/types';

export interface PostTheme {
  title: string;
  subtitle: string;
}

export const POST_THEMES: Record<PostType, PostTheme[]> = {
  物件開箱: [
    { title: '開箱這間房', subtitle: '說實話，這間採光驚豔到我，真的沒話說' },
    { title: '帶你看好屋', subtitle: '找好久，終於等到這間精品釋出' },
    { title: '市心精品宅', subtitle: '走進這客廳，我已經在想未來的日子' },
    { title: '視野沒話說', subtitle: '懂生活的人，這間細節會讓你點頭' },
    { title: '心動起家厝', subtitle: '幫大家看過了，這空間甜得剛剛好' },
    { title: '隱藏版好房', subtitle: '市中心竟然藏著這種質感，值得你看一眼' },
    { title: '採光一級棒', subtitle: '第一眼就心動，這是懂生活的人在住的' },
    { title: '高樓景觀房', subtitle: '回家就是放鬆，這視野幫你帶走一身疲憊' },
    { title: '質感新生活', subtitle: '空間是有靈魂的，這間房正等著懂它的人' },
    { title: '夢幻第一站', subtitle: '成家不難，難的是遇到這麼契合的空間' },
  ],
  降價急售: [
    { title: '驚喜甜甜價', subtitle: '這種價格不能再等，屋主誠意滿滿' },
    { title: '屋主誠意售', subtitle: '比實登還甜的價格，看完心跳會漏拍' },
    { title: '限時搶購中', subtitle: '錯過這間，下次不知道要讓你等多久' },
    { title: '低於實價登', subtitle: '價格回到底部，懂地脈的朋友快找福哥' },
    { title: '錯過就沒了', subtitle: '屋主忍痛割愛，這份機會我想留給你' },
    { title: '精華區首選', subtitle: '只有這一間，速度決定你資產的財度' },
    { title: '超值不等人', subtitle: '全區最划算，福哥掛保證的投資眼光' },
    { title: '降價最有感', subtitle: '機會是留給準備好的人，這價格真的絕' },
    { title: '急尋新屋主', subtitle: '買房看氣場，這開價連我都想出手' },
    { title: '投資必看款', subtitle: '精準鎖定增值力，幫你圓夢又守住財' },
  ],
  知識教學: [
    { title: '福哥碎碎念', subtitle: '買房老實話：這幾個關鍵點最保值' },
    { title: '地產軍師說', subtitle: '三十年內行祕密，教你看懂土地價值' },
    { title: '買房不踩雷', subtitle: '別只看價格，結構跟地段才是靈魂' },
    { title: '教你挑好宅', subtitle: '很多人問我，現在這區該怎麼佈局？' },
    { title: '內行看地段', subtitle: '避開這幾個坑，買房圓夢才能住得安心' },
    { title: '投資小教室', subtitle: '買房是住一輩子，投資眼光要看一輩子' },
    { title: '三十年經驗', subtitle: '懂地更懂你，福哥分享花蓮房產地圖' },
    { title: '選房大哉問', subtitle: '為什麼大家都愛選這區？我分析給你聽' },
    { title: '房產心法傳', subtitle: '專業是底氣，眼光是財氣，幫你精準對接' },
    { title: '圓夢避坑指南', subtitle: '用三十年的專業，護航你的每一份信任' },
  ],
  人設生活: [
    { title: '顧問忙什麼', subtitle: '忙完帶看聊聊地產，這是我們的日常堅持' },
    { title: '陪你圓夢中', subtitle: '陪客戶找到心儀的家，是最累也最美的' },
    { title: '福哥日常筆', subtitle: '穿梭花蓮巷弄，只為幫你找尋土地的溫度' },
    { title: '美珍心語錄', subtitle: '看到客戶成交的笑容，累一點也值得' },
    { title: '專業雙搭檔', subtitle: '三十年如一日，最愛看客戶圓夢的那一刻' },
    { title: '看房趣分享', subtitle: '專業背後，是我們對每一份委託的珍惜' },
    { title: '在地老鄰居', subtitle: '買房找對人，省心又安穩，福哥一直在這' },
    { title: '成家的路上', subtitle: '溫暖成家路，我們陪你一步一腳印走過' },
    { title: '房產真心話', subtitle: '信任是三十年的累積，服務最懂你的心' },
    { title: '今天聊聊天', subtitle: '忙碌但充實，這就是我們熱愛房產的初衷' },
  ],
  成交喜報: [
    { title: '賀順利成交', subtitle: '成交不只是買賣，是幫你找到好歸宿' },
    { title: '恭喜圓夢了', subtitle: '感謝客戶信任，這份緣分福哥最珍惜' },
    { title: '好房得好主', subtitle: '恭喜成交！這間房終於等到對的主人' },
    { title: '感謝你信任', subtitle: '看到你圓夢那刻，我們心裡也好溫暖' },
    { title: '圓夢全紀錄', subtitle: '又一個圓夢故事，在花蓮這片土地落幕' },
    { title: '成交好福氣', subtitle: '幫客戶談到好價，是我們最大的成就感' },
    { title: '專業有效率', subtitle: '感謝委託，專業雙搭檔再次達成使命' },
    { title: '財氣進家門', subtitle: '恭喜成交，福氣跟著你一起搬進去' },
    { title: '順利交屋囉', subtitle: '把喜悅留給你，把專業細節交給我們' },
    { title: '緣分結碩果', subtitle: '看到客戶成家的喜悅，這就是我們的動力' },
  ],
  開發徵件: [
    { title: '專業代尋房', subtitle: '把專業交給福哥，把時間留給家人' },
    { title: '誠徵好屋主', subtitle: '深耕花蓮的溫度，最懂你在意的細節' },
    { title: '顧問代委託', subtitle: '你對家的期待，福哥與美珍最懂' },
    { title: '尋找起家厝', subtitle: '懂土地的價值，福哥更懂你的心' },
    { title: '誠徵好物件', subtitle: '想尋找下一位好主人？交給雙搭檔最安心' },
    { title: '委託最放心', subtitle: '用心看待每一份委託，圓夢路上有我們' },
    { title: '房產經紀人', subtitle: '三十年在地交情，懂房更懂你的需求' },
    { title: '誠尋本區房', subtitle: '你想賣的不只是房，是一份珍貴的託付' },
    { title: '專業幫你賣', subtitle: '把繁瑣交給雙搭檔，把喜悅留給自己' },
    { title: '資產代管理', subtitle: '深耕三十載的信任，懂房更懂你在乎的價值' },
  ],
};

export function randomPostTheme(postType: PostType): PostTheme {
  const themes = POST_THEMES[postType];
  return themes[Math.floor(Math.random() * themes.length)];
}
