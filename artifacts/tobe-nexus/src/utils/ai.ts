import { Property, PostType, HookType } from '../types';
import { fallbackHooks } from './copywritingTemplates';

export const generateCopywriting = (
  property: Property,
  postType: PostType,
  hookType: HookType
): string => {
  const {
    subarea, property_type, price_wan, build_ping, parking, 
    rooms, halls, baths, balconies,
    main_point, second_point, target_buyer, must_say_3,
    status_push,
  } = property;

  const extractText = (val: string) => (val ? val.split(' | ')[0].trim() : '');
  const main = extractText(main_point);
  const second = extractText(second_point);
  const target = extractText(target_buyer);

  const title = `${subarea} ${property_type}`;
  const layoutStr = `${rooms}房${halls}廳${baths}衛${balconies}陽台`;

  const isOffice = property_type === '商辦';
  const isShop   = property_type === '店面' || property_type === '透天厝 (店住)';

  const baseInfo = isOffice
    ? `📍 【核心物件資訊】
位於${subarea}的稀有${property_type}，專為重視企業形象的經營者打造。
總建坪 ${build_ping} 坪，格局方正、採光優越，${parking ? `附有${extractText(parking)}，` : ''}
員工上下班動線便利，辦公效率倍增。
現在開價 ${price_wan} 萬，是花蓮商辦市場的精選入主機會！`
    : isShop
    ? `📍 【核心物件資訊】
${subarea}黃金地段的優質${property_type}，吸金人流就是您最大的資產。
總建坪 ${build_ping} 坪，${parking ? `附有${extractText(parking)}，` : ''}
鄰近人潮聚集核心，進出卸貨方便，開店即有穩定客源。
現在開價 ${price_wan} 萬，是創業自營、收租投資的首選！`
    : `📍 【核心物件資訊】
這是一間位於${subarea}的優質${property_type}。
總建坪達 ${build_ping} 坪，擁有 ${layoutStr} 的格局，
${parking ? `附有${extractText(parking)}` : '目前無車位'}。
現在屋主開價僅需 ${price_wan} 萬，是${subarea}買屋首選！`;

  const formatMustSay = (text: string) => {
    if (!text) return '';
    const points = text.split('\n').filter(Boolean);
    return points.map((p) => `✓ ${extractText(p)}`).join('\n');
  };

  const mustSayItems = formatMustSay(must_say_3);
  const mustSayStr = mustSayItems
    ? `🌟 【三大核心優勢】\n${mustSayItems}`
    : '';

  const contactInfo = `
👇 懂價值，就現在聯絡我：
📞 專線：0925-997779
💬 官方 LINE：https://lin.ee/uCoFu3E
👤 花蓮房產顧問福哥 周福良`;

  const footer = `\n------------------------\n【花蓮房屋與土地買賣】\n30年在地經驗，為您把關資產。${contactInfo}\n`;

  const getHookText = () => {
    if (hookType === '無') {
      const randomHook = (hooks: string[]) =>
        hooks[Math.floor(Math.random() * hooks.length)];
      switch (postType) {
        case '降價急售':
          return randomHook(fallbackHooks['降價急售']).replace('{subarea}', subarea);
        case '成交喜報':
          return randomHook(fallbackHooks['成交喜報']).replace('{subarea}', subarea);
        case '知識教學':
          return randomHook(fallbackHooks['知識教學']).replace('{subarea}', subarea);
        case '人設生活':
          return randomHook(fallbackHooks['人設生活']).replace('{subarea}', subarea);
        case '物件開箱':
        default:
          return randomHook(fallbackHooks['物件開箱'])
            .replace('{subarea}', subarea)
            .replace('{property_type}', property_type);
      }
    }

    switch (hookType) {
      case '專業焦慮鉤':
        return `【您還在觀望嗎？好地段是不等人的！】\n看著房價變動，與其焦慮不如精準出手。這間位於${subarea}的稀有${property_type}，正等待真正懂它價值的您！`;
      case '知識佈道鉤':
        return `【專業，是幫你避開看不見的坑】\n在花蓮看房地產 30 年，我成交超過一千位客戶。\n很多物件，別人看的是「開價」，我看的是「命格」。`;
      case '利益誘惑鉤':
        return `【低於實價登錄的超值好案，錯過不再有！】\n如果您的預算是 ${price_wan} 萬上下，這間絕對是近期 C/P 值最高的首選，買到直接賺到！`;
      case '情感溫度鉤':
      default:
        return `【尋找一個充滿溫度的家，從這裡開始】\n每一次帶看，我都能想像未來屋主在這裡幸福生活的模樣。這是一間充滿潛力的好房子，期待與您分享。`;
    }
  };

  const hookText = getHookText();
  const hookPrefix = hookText ? `${hookText}\n\n` : '';

  switch (postType) {
    case '物件開箱':
      return `${hookPrefix}【🏠 新案開箱 | ${subarea}${property_type} | ${price_wan}萬】
${title} 絕美釋出！${status_push === '強推' ? '🔥 本週必看精選！\n' : ''}

${baseInfo}

${mustSayStr}
${second ? `\n✨ 【進階亮點】\n✓ ${second}` : ''}
${target ? `\n🎯 【適合對象】\n這間房子特別適合：${target}的朋友` : ''}

${footer}`;

    case '降價急售':
      return `${hookPrefix}【🚨 降價急售 | ${subarea}${property_type} | 下殺至 ${price_wan}萬】
「${title}」屋主決心割愛，這絕對是本月最震撼的破盤價格 💥！

${baseInfo}

${mustSayStr}

⏳ 屋主因故急需資金，忍痛割愛！
速度決定一切，晚來只能看別人買走！

${footer}`;

    case '知識教學':
      return `${hookPrefix}【📚 房產小學堂：看懂 ${subarea} ${property_type} 的隱藏潛力】
很多客戶問我，為什麼這個區域的物件這麼搶手？
今天用這間「${title}」為例，帶你看懂市場優勢：

${baseInfo}

${mustSayStr}
${second ? `\n✨ 【內行人才懂的加分項】\n✓ ${second}` : ''}

買對房子，比買便宜更重要！想了解更多房產心法，歡迎找福哥聊聊！

${footer}`;

    case '人設生活':
      return `${hookPrefix}【🤝 福哥嚴選好屋 | ${subarea}${property_type} | ${price_wan}萬】
如果你要買的是一個家、一塊能傳世的資產，
與其聽天花亂墜的推銷，不如找一個幫你踩過上千次坑的在地老手。

${baseInfo}

${mustSayStr}
${second ? `這間物件的【${second}】，只有內行人才看得懂。` : ''}

我不只是賣房子，我是幫你的資產把關。

${footer}`;

    case '成交喜報':
      return `${hookPrefix}【🎉 狂賀！${subarea}${property_type} 順利成交 🎉】
恭喜買賣雙方！又完成了一樁圓滿的交易！

這間「${title}」之所以能這麼快成交，
靠的就是它無敵的條件：

${mustSayStr}

好的物件總是不等人！如果您也正在尋找類似的房子，
或是您的愛屋正準備出售，請放心交給福哥！

${footer}`;

    case '商辦店面':
      return isOffice
        ? `${hookPrefix}【🏢 商辦精選 | ${subarea}${property_type} | ${price_wan}萬】
企業形象決定客戶第一印象，辦公環境決定員工生產力！

${baseInfo}

${mustSayStr}
${second ? `\n✨ 【辦公環境加分項】\n✓ ${second}` : ''}
${target ? `\n🎯 【最適合對象】\n${target}的企業主與投資人` : ''}

${footer}`
        : `${hookPrefix}【🏪 黃金店面 | ${subarea}${property_type} | ${price_wan}萬】
人潮就是錢潮，地段選對，生意強強滾！

${baseInfo}

${mustSayStr}
${second ? `\n✨ 【經營便利加分項】\n✓ ${second}` : ''}
${target ? `\n🎯 【最適合對象】\n${target}的創業者與投資人` : ''}

${footer}`;

    default:
      return `${hookText}\n\n${baseInfo}\n\n${footer}`;
  }
};
