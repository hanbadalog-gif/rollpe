// 기본 스티커 — public/stickers/*.png (롤페작업/스티커 폴더의 투명 PNG 26장). 추가하려면 파일을 넣고 아래 목록에 이름만 적는다
export const STICKER_CATEGORIES: { label: string; stickers: string[] }[] = [
  { label: "축하", stickers: ["/stickers/birthday.png", "/stickers/balloon.png", "/stickers/confetti.png", "/stickers/sparkle.png", "/stickers/star.png", "/stickers/rainbow.png"] },
  { label: "마음", stickers: ["/stickers/heart.png", "/stickers/heart2.png", "/stickers/heart3.png", "/stickers/iloveyou.png", "/stickers/thankyou.png", "/stickers/flower.png"] },
  { label: "응원", stickers: ["/stickers/cheer.png", "/stickers/emphasis.png"] },
  { label: "수능", stickers: ["/stickers/suneung-daebak.png", "/stickers/suneung-clover.png", "/stickers/suneung-100.png", "/stickers/suneung-cheer.png", "/stickers/suneung-tissue.png"] },
  { label: "꾸미기", stickers: ["/stickers/ribbon1.png", "/stickers/ribbon2.png", "/stickers/ribbon3.png", "/stickers/dots1.png", "/stickers/dots2.png", "/stickers/clip.png", "/stickers/snow.png"] },
];
