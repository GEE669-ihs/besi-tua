from django import forms
from django.forms import inlineformset_factory

from .models import ItemNota, Nota


class NotaForm(forms.ModelForm):
    class Meta:
        model = Nota
        fields = ["lapak", "tanggal"]
        widgets = {"tanggal": forms.DateInput(attrs={"type": "date"}, format="%Y-%m-%d")}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["lapak"].empty_label = "Pilih lapak"


class ItemNotaForm(forms.ModelForm):
    class Meta:
        model = ItemNota
        fields = ["barang", "berat_kg", "harga_per_kg"]
        widgets = {
            "berat_kg": forms.NumberInput(attrs={"step": "0.1", "min": "0", "inputmode": "decimal"}),
            "harga_per_kg": forms.NumberInput(attrs={"step": "1", "min": "0", "inputmode": "numeric"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["barang"].empty_label = "Pilih barang"


ItemNotaFormSet = inlineformset_factory(
    Nota, ItemNota, form=ItemNotaForm,
    extra=0, min_num=1, validate_min=True, can_delete=False,
)