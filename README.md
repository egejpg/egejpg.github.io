# egejpg.github.io

egejpg tarayıcı eklentilerinin tanıtım sitesi: https://egejpg.github.io

Derleme adımı, bağımlılık ya da dış kaynak yok. Düz HTML, CSS ve JS; fontlar da sitenin içinde (ziyaretçi hiçbir üçüncü taraf sunucuya bağlanmaz).

## Yapı

Varsayılan dil İngilizce (kök adres), Türkçe sayfalar `/tr/` altında. Her sayfanın iki dilde de aynı yolu var.

```
index.html, contact-exporter/…        İngilizce sayfalar
tr/index.html, tr/contact-exporter/…  Türkçe sayfalar
contact-exporter/privacy/             Gizlilik politikası (Chrome Web Store bu adresi ister)
404.html                              İki dilli hata sayfası (/tr/ altında Türkçe)
assets/css/site.css                   Tüm stiller (renkler en üstte :root içinde)
assets/js/site.js                     Seçici, sürükleme, derinlik efekti, dil seçici, e-posta koruması
assets/fonts/                         Plus Jakarta Sans (OFL lisansı: OFL.txt)
assets/img/<eklenti>/                 Eklenti görselleri
```

## Dil seçimi

- İlk ziyarette cihazın saat dilimi Türkiye ise (`Europe/Istanbul`) İngilizce sayfa Türkçe karşılığına yönlenir. IP'den konum bulunmaz, izin istenmez, hiçbir yere veri gitmez.
- Sağ üstteki bayraklar `?lang=en` / `?lang=tr` ekiyle bağlanır; sayfanın başındaki betik seçimi kaydeder (`localStorage`) ve eki adresten siler. JavaScript dosyası yüklenmese bile çalışır. Kayıtlı seçim otomatik geçişin yerine geçer.
- `/en` ve `/en/...` adresleri (404 sayfası üzerinden) aynı sayfanın İngilizcesine yönlenir.
- Her sayfanın `<head>` kısmında iki dildeki karşılığına `hreflang` bağlantıları var; arama motorları doğru dili gösterir.

## E-posta

Adres sayfa kaynağında düz yazılmaz: `data-u` / `data-d` öznitelikleri ters çevrilmiş parçaları tutar, `site.js` bağlantıyı tıklanabilir hale getirir.

## CSS/JS değiştirince

`node tools/stamp.mjs` çalıştır. Sayfalardaki `site.css` ve `site.js` adreslerine içerik özetinden bir sürüm etiketi (`?v=…`) yazar; böylece ziyaretçiler eski kopyayı önbellekten kullanamaz (GitHub Pages dosyaları 10 dakika önbellekte tutar).

## Yerelde çalıştırma

Yollar `/` ile başladığı için dosyayı çift tıklayarak değil, bir sunucuyla aç:

```sh
npx serve .        # ya da: python -m http.server
```

## Yeni eklenti eklerken

1. `index.html` ve `tr/index.html` içinde "next one / sıradaki eklenti" slaytını yeni eklentinin kartıyla değiştir.
2. `contact-exporter/` ve `tr/contact-exporter/` klasörlerini kopyalayıp yeni eklentinin adıyla yeniden adlandır; metinleri, görselleri, `hreflang` ve dil seçici bağlantılarını güncelle.
3. `sitemap.xml`'e yeni adresleri (iki dil) ve alt bilgiye bağlantıyı ekle.
4. Eklentinin `manifest.json` dosyasına `"homepage_url"` olarak İngilizce sayfayı koy.

## Mağaza bağlantısı yayınlanınca

`contact-exporter/index.html` ve `tr/contact-exporter/index.html` içinde "Coming soon / yakında" yazan `span`'i, hemen üstündeki yorumdaki gibi mağaza bağlantılı bir düğmeyle değiştir.
