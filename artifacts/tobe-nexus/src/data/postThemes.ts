import { PostType } from '@/types';

export interface PostTheme {
  title: string;
  subtitle: string;
}

export const POST_THEMES: Record<PostType, PostTheme[]> = {
  物件開箱: [
    { title: '開箱這間房', subtitle: '採光驚豔，真的沒話說' },
    { title: '帶你看好屋', subtitle: '找好久，終於等到這間精品釋出' },
    { title: '市心精品宅', subtitle: '走進客廳就想像未來' },
    { title: '視野沒話說', subtitle: '懂生活的你，看這細節' },
    { title: '心動起家厝', subtitle: '這空間甜度剛剛好' },
  ],
  降價急售: [
    { title: '驚喜甜甜價', subtitle: '屋主誠意，不等人的價格' },
    { title: '屋主誠意售', subtitle: '比實登甜，心跳漏拍' },
    { title: '限時搶購中', subtitle: '錯過這間，下次不知要等多久' },
    { title: '低於實價登', subtitle: '懂地脈的快來找福哥' },
    { title: '錯過就沒了', subtitle: '屋主割愛，機會留給你' },
  ],
  知識教學: [
    { title: '福哥碎碎念', subtitle: '這幾個關鍵點最保值' },
    { title: '地產軍師說', subtitle: '內行秘密教你看懂土地' },
    { title: '買房不踩雷', subtitle: '結構跟地段才是靈魂' },
    { title: '教你挑好宅', subtitle: '現在這區該怎麼佈局？' },
    { title: '內行看地段', subtitle: '避坑才能住得安心' },
  ],
  人設生活: [
    { title: '顧問忙什麼', subtitle: '帶看聊地產是日常堅持' },
    { title: '陪你圓夢中', subtitle: '找到心儀的家最累也最美' },
    { title: '福哥日常筆', subtitle: '穿梭巷弄找土地的溫度' },
    { title: '美珍心語錄', subtitle: '看到成交笑容，累也值得' },
    { title: '專業雙搭檔', subtitle: '最愛看客戶圓夢那一刻' },
  ],
  成交喜報: [
    { title: '賀順利成交', subtitle: '成交是幫你找到好歸宿' },
    { title: '恭喜圓夢了', subtitle: '這份緣分福哥最珍惜' },
    { title: '好房得好主', subtitle: '這間房等到對的主人了' },
    { title: '感謝你信任', subtitle: '圓夢那刻心裡好溫暖' },
    { title: '圓夢全紀錄', subtitle: '圓夢故事在花蓮落幕' },
  ],
  資產配置: [
    { title: '抗通膨首選', subtitle: '精華區土地是財富盾牌' },
    { title: '守護資產力', subtitle: '換成增值資產才是獲利' },
    { title: '資產定海神', subtitle: '讓資產在好房裡生利息' },
    { title: '聰明理財術', subtitle: '趁低佈局未來感謝果斷' },
    { title: '財富傳承路', subtitle: '留間房是最長情的愛' },
  ],
  土地潛力: [
    { title: '開疆闢土賽', subtitle: '買地是買被仰望的機會' },
    { title: '投資新座標', subtitle: '福哥帶你看懂翻身密碼' },
    { title: '地脈淘金術', subtitle: '荒地藏翻身密碼看懂贏' },
    { title: '大地主計畫', subtitle: '佔位成功就掌握未來' },
    { title: '發財夢起點', subtitle: '種下三代的財富夢想' },
  ],
  成家圓夢: [
    { title: '終於有個家', subtitle: '給家人一個穩定的港灣' },
    { title: '幸福起跑點', subtitle: '這鑰匙開啟半輩子的笑聲' },
    { title: '圓夢第一站', subtitle: '難的是遇到那個懂你的人' },
    { title: '承諾的重量', subtitle: '買房是最浪漫的告白' },
    { title: '心靈的堡壘', subtitle: '背後有座溫暖的家' },
  ],
};

export function randomPostTheme(postType: PostType): PostTheme {
  const themes = POST_THEMES[postType];
  return themes[Math.floor(Math.random() * themes.length)];
}
