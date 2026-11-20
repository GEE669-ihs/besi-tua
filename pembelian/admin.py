from django.contrib import admin
from .models import Lapak, Barang, Nota, ItemNota, Pabrik, Penjualan, ItemPenjualan


def rupiah(angka):
    return "Rp " + f"{angka:,.0f}".replace(",", ".")


class ItemNotaInline(admin.TabularInline):
    model = ItemNota
    extra = 5
    readonly_fields = ("jumlah_rp",)

    @admin.display(description="Jumlah")
    def jumlah_rp(self, obj):
        return rupiah(obj.jumlah) if obj.pk else "-"


@admin.register(Nota)
class NotaAdmin(admin.ModelAdmin):
    inlines = [ItemNotaInline]
    list_display = ("tanggal", "lapak", "total_rp", "dibatalkan")
    list_filter = ("tanggal", "lapak", "dibatalkan")

    @admin.display(description="Total")
    def total_rp(self, obj):
        return rupiah(obj.total)


class ItemPenjualanInline(admin.TabularInline):
    model = ItemPenjualan
    extra = 3
    readonly_fields = ("jumlah_rp",)

    @admin.display(description="Subtotal")
    def jumlah_rp(self, obj):
        return rupiah(obj.jumlah) if obj.pk else "-"


@admin.register(Penjualan)
class PenjualanAdmin(admin.ModelAdmin):
    inlines = [ItemPenjualanInline]
    list_display = ("tanggal", "pabrik", "plat_truk", "nomor_surat_jalan", "total_rp", "dibatalkan")
    list_filter = ("tanggal", "pabrik", "dibatalkan")

    @admin.display(description="Total Jual")
    def total_rp(self, obj):
        return rupiah(obj.total)


admin.site.register(Lapak)
admin.site.register(Barang)
admin.site.register(Pabrik)
