from django.db import models


class Lapak(models.Model):
    nama = models.CharField(max_length=100)
    catatan = models.TextField(blank=True)

    class Meta:
        verbose_name = "ranting"
        verbose_name_plural = "ranting"

    def __str__(self):
        return self.nama


class Barang(models.Model):
    nama = models.CharField(max_length=50)
    harga_default = models.DecimalField(max_digits=10, decimal_places=0)

    class Meta:
        verbose_name_plural = "barang"

    def __str__(self):
        return self.nama


class Nota(models.Model):
    lapak = models.ForeignKey(Lapak, on_delete=models.PROTECT)
    tanggal = models.DateField()

    class Meta:
        ordering = ["-tanggal", "-id"]

    def __str__(self):
        return f"{self.lapak} - {self.tanggal}"

    @property
    def total(self):
        return sum(item.jumlah for item in self.items.all())


class ItemNota(models.Model):
    nota = models.ForeignKey(Nota, related_name="items", on_delete=models.CASCADE)
    barang = models.ForeignKey(Barang, on_delete=models.PROTECT)
    berat_kg = models.DecimalField(max_digits=8, decimal_places=1)
    harga_per_kg = models.DecimalField(max_digits=10, decimal_places=0)

    @property
    def jumlah(self):
        return self.berat_kg * self.harga_per_kg
