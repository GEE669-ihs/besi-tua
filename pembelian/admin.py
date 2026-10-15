from django.contrib import admin
from .models import Lapak, Barang, Nota, ItemNota


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
    list_display = ("tanggal", "lapak", "total_rp")
    list_filter = ("tanggal", "lapak")

    @admin.display(description="Total")
    def total_rp(self, obj):
        return rupiah(obj.total)


admin.site.register(Lapak)
admin.site.register(Barang)
