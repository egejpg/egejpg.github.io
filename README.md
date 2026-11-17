# egejpg.github.io

egejpg tarayıcı eklentilerinin tanıtım sitesi: https://egejpg.github.io

Derleme adımı, bağımlılık ya da dış kaynak yok. Düz HTML, CSS ve JS; fontlar da sitenin içinde (ziyaretçi hiçbir üçüncü taraf sunucuya bağlanmaz).

## Yapı

```
index.html                       Ana sayfa: eklenti seçici sahnesi, ilkeler, iletişim
contact-exporter/index.html      Eklenti sayfası
contact-exporter/privacy/        Gizlilik politikası (Chrome Web Store bu adresi ister)
404.html                         GitHub Pages hata sayfası
assets/css/site.css              Tüm stiller (renkler en üstte :root içinde)
assets/js/site.js                Seçici, sürükleme, derinlik efekti, belirme animasyonları
assets/fonts/                    Plus Jakarta Sans (OFL lisansı: OFL.txt)
assets/img/<eklenti>/            Eklenti görselleri
```

## Yerelde çalıştırma

Yollar `/` ile başladığı için dosyayı çift tıklayarak değil, bir sunucuyla aç:

```sh
npx serve .        # ya da: python -m http.server
```

## Yeni eklenti eklerken

1. `index.html` içinde `.carousel-track` altındaki "Sıradaki eklenti yolda" slaytını yeni eklentinin kartıyla değiştir (Contact Exporter slaytını kopyalayıp başla).
2. `contact-exporter/` klasörünü kopyalayıp yeni eklentinin adıyla yeniden adlandır, metinleri ve görselleri değiştir.
3. Gizlilik sayfasını ekle, `sitemap.xml`'e yeni adresleri ve alt bilgiye bağlantıyı yaz.
4. Eklentinin `manifest.json` dosyasına `"homepage_url"` olarak yeni sayfayı koy.

## Mağaza bağlantısı yayınlanınca

`contact-exporter/index.html` içinde "Chrome Web Store'da yakında" yazan `span`'i, hemen üstündeki yorumdaki gibi mağaza bağlantılı bir düğmeyle değiştir.
