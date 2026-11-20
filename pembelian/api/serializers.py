from rest_framework import serializers
from django.db import transaction
from ..models import Lapak, Barang, Nota, ItemNota, Pabrik, Penjualan, ItemPenjualan


class LapakSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lapak
        fields = ["id", "nama", "catatan"]


class BarangSerializer(serializers.ModelSerializer):
    kelompok_display = serializers.CharField(source="get_kelompok_display", read_only=True)

    class Meta:
        model = Barang
        fields = ["id", "nama", "kelompok", "kelompok_display", "harga_default"]


class ItemNotaSerializer(serializers.ModelSerializer):
    barang_nama = serializers.CharField(source="barang.nama", read_only=True)
    barang_kelompok = serializers.CharField(source="barang.kelompok", read_only=True)
    jumlah = serializers.DecimalField(max_digits=16, decimal_places=1, read_only=True)

    class Meta:
        model = ItemNota
        fields = ["id", "barang", "barang_nama", "barang_kelompok", "berat_kg", "harga_per_kg", "jumlah"]


class NotaSerializer(serializers.ModelSerializer):
    lapak_nama = serializers.CharField(source="lapak.nama", read_only=True)
    items = ItemNotaSerializer(many=True)
    total = serializers.DecimalField(max_digits=16, decimal_places=1, read_only=True)
    dibatalkan_oleh_username = serializers.CharField(source="dibatalkan_oleh.username", read_only=True)

    class Meta:
        model = Nota
        fields = [
            "id",
            "lapak",
            "lapak_nama",
            "tanggal",
            "dibatalkan",
            "alasan_batal",
            "dibatalkan_pada",
            "dibatalkan_oleh",
            "dibatalkan_oleh_username",
            "items",
            "total",
        ]
        read_only_fields = [
            "dibatalkan",
            "alasan_batal",
            "dibatalkan_pada",
            "dibatalkan_oleh",
            "dibatalkan_oleh_username",
        ]

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Nota harus memiliki minimal satu item barang.")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        with transaction.atomic():
            nota = Nota.objects.create(**validated_data)
            for item in items_data:
                ItemNota.objects.create(nota=nota, **item)
        return nota

    def update(self, instance, validated_data):
        if instance.dibatalkan:
            raise serializers.ValidationError("Nota yang sudah dibatalkan tidak dapat diubah.")
        
        items_data = validated_data.pop("items", None)
        with transaction.atomic():
            instance.lapak = validated_data.get("lapak", instance.lapak)
            instance.tanggal = validated_data.get("tanggal", instance.tanggal)
            instance.save()

            if items_data is not None:
                instance.items.all().delete()
                for item in items_data:
                    ItemNota.objects.create(nota=instance, **item)
        return instance


class BatalkanNotaSerializer(serializers.Serializer):
    alasan = serializers.CharField(max_length=200, required=True, allow_blank=False)


class PabrikSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pabrik
        fields = ["id", "nama", "telepon", "alamat", "catatan"]


class ItemPenjualanSerializer(serializers.ModelSerializer):
    barang_nama = serializers.CharField(source="barang.nama", read_only=True)
    barang_kelompok = serializers.CharField(source="barang.kelompok", read_only=True)
    jumlah = serializers.DecimalField(max_digits=16, decimal_places=1, read_only=True)

    class Meta:
        model = ItemPenjualan
        fields = ["id", "barang", "barang_nama", "barang_kelompok", "berat_kg", "harga_per_kg", "jumlah"]


class PenjualanSerializer(serializers.ModelSerializer):
    pabrik_nama = serializers.CharField(source="pabrik.nama", read_only=True)
    items = ItemPenjualanSerializer(many=True)
    total = serializers.DecimalField(max_digits=16, decimal_places=1, read_only=True)
    total_berat = serializers.DecimalField(max_digits=16, decimal_places=1, read_only=True)
    dibatalkan_oleh_username = serializers.CharField(source="dibatalkan_oleh.username", read_only=True)

    class Meta:
        model = Penjualan
        fields = [
            "id",
            "pabrik",
            "pabrik_nama",
            "tanggal",
            "nomor_surat_jalan",
            "plat_truk",
            "sopir",
            "keterangan",
            "dibatalkan",
            "alasan_batal",
            "dibatalkan_pada",
            "dibatalkan_oleh",
            "dibatalkan_oleh_username",
            "items",
            "total",
            "total_berat",
        ]
        read_only_fields = [
            "dibatalkan",
            "alasan_batal",
            "dibatalkan_pada",
            "dibatalkan_oleh",
            "dibatalkan_oleh_username",
        ]

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Pengiriman harus memiliki minimal satu item barang.")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        with transaction.atomic():
            penjualan = Penjualan.objects.create(**validated_data)
            for item in items_data:
                ItemPenjualan.objects.create(penjualan=penjualan, **item)
        return penjualan

    def update(self, instance, validated_data):
        if instance.dibatalkan:
            raise serializers.ValidationError("Penjualan yang sudah dibatalkan tidak dapat diubah.")

        items_data = validated_data.pop("items", None)
        with transaction.atomic():
            for attr, val in validated_data.items():
                setattr(instance, attr, val)
            instance.save()

            if items_data is not None:
                instance.items.all().delete()
                for item in items_data:
                    ItemPenjualan.objects.create(penjualan=instance, **item)
        return instance


class BatalkanPenjualanSerializer(serializers.Serializer):
    alasan = serializers.CharField(max_length=200, required=True, allow_blank=False)

