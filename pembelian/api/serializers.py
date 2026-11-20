from rest_framework import serializers
from django.db import transaction
from ..models import Lapak, Barang, Nota, ItemNota


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
