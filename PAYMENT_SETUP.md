# MIDAS V8 — To'lov Integratsiyasi

## Hozirgi holat
- Premium obuna UI tayyor (mock)
- Real to'lov integratsiyasi keyinroq qo'shiladi

## Qo'shilishi kerak bo'lgan platformalar

### Click
- Dashboard: https://business.click.uz
- Docs: https://docs.click.uz
- Callback URL: `https://midas-backend.onrender.com/api/payment/click/callback`

### Payme
- Dashboard: https://checkout.paycom.uz
- Docs: https://developer.paycom.uz
- Merchant ID: `[KEYIN QO'SHILADI]`
- Callback URL: `https://midas-backend.onrender.com/api/payment/payme/callback`

### UzCard / Humo
- API integratsiya keyinroq

## Narxlar
| Reja     | Narx        | Muddat |
|----------|-------------|--------|
| Starter  | 49,900 so'm | 30 kun |
| Pro      | 99,900 so'm | 30 kun |
| Business | 199,900 so'm| 30 kun |

## Backend endpoint (qo'shish kerak)
```python
@app.route("/api/payment/click/callback", methods=["POST"])
def click_callback():
    # Click to'lov tasdiqlash
    pass

@app.route("/api/payment/payme/callback", methods=["POST"])  
def payme_callback():
    # Payme to'lov tasdiqlash
    pass
```
