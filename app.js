(function () {
  'use strict';

  var form = document.getElementById('sim-form');
  var facilitySelect = document.getElementById('facility-type');
  var contractKwInput = document.getElementById('contract-kw');
  var monthlyKwhInput = document.getElementById('monthly-kwh');
  var errorEl = document.getElementById('sim-error');
  var resultEl = document.getElementById('sim-result');

  var resFacility = document.getElementById('res-facility');
  var resTotal = document.getElementById('res-total');
  var resLoadRate = document.getElementById('res-load-rate');
  var resLoadInline = document.getElementById('res-load-inline');

  var resBasic = document.getElementById('res-basic');
  var resEnergy = document.getElementById('res-energy');
  var resRenewable = document.getElementById('res-renewable');

  var ratioBasic = document.getElementById('ratio-basic');
  var ratioEnergy = document.getElementById('ratio-energy');
  var ratioRenewable = document.getElementById('ratio-renewable');

  var barBasic = document.getElementById('bar-basic');
  var barEnergy = document.getElementById('bar-energy');
  var barRenewable = document.getElementById('bar-renewable');

  var resInsightText = document.getElementById('res-insight-text');

  function formatYen(amount) {
    return Math.round(amount).toLocaleString('ja-JP') + '円';
  }

  function formatPercent(value) {
    return value.toFixed(1) + '%';
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    resultEl.hidden = true;
  }

  function clearError() {
    errorEl.textContent = '';
    errorEl.hidden = true;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var rawKw = contractKwInput.value.trim();
    var rawKwh = monthlyKwhInput.value.trim();

    if (rawKw === '' || rawKwh === '') {
      showError('契約電力（kW）と月間使用量（kWh）の両方を入力してください。');
      return;
    }

    var contractKw = Number(rawKw);
    var monthlyKwh = Number(rawKwh);

    if (!Number.isFinite(contractKw) || !Number.isFinite(monthlyKwh) || contractKw <= 0 || monthlyKwh <= 0) {
      showError('契約電力と月間使用量には、0より大きい数値を入力してください。');
      return;
    }

    clearError();

    // 計算式（ベーシックプランの公開単価ベースの概算）
    // 基本料金 ＝ 2,530円 × 契約電力(kW) × 0.85（力率100%前提）
    // 電力量料金 ＝ 17.43円 × 月間使用量(kWh)
    // 再エネ賦課金 ＝ 4.18円 × 月間使用量(kWh)
    // 月額目安 ＝ 上記3つの合計
    var basicCharge = 2530 * contractKw * 0.85;
    var energyCharge = 17.43 * monthlyKwh;
    var renewableCharge = 4.18 * monthlyKwh;
    var totalCharge = basicCharge + energyCharge + renewableCharge;

    // 構成比（%）
    var basicPct = (basicCharge / totalCharge) * 100;
    var energyPct = (energyCharge / totalCharge) * 100;
    var renewablePct = Math.max(0, 100 - basicPct - energyPct);

    // 負荷率 ＝ 月間使用量 ÷（契約電力 × 720時間）
    var loadFactorRatio = monthlyKwh / (contractKw * 720);
    var loadFactorPct = loadFactorRatio * 100;

    // 見直しの論点（負荷率で出し分け）
    var insightMessage = '';
    if (loadFactorPct < 25) {
      insightMessage = '基本料金の比重が高い構造です。契約電力と実際の最大需要のバランスが、見直しの論点になります。';
    } else if (loadFactorPct <= 45) {
      insightMessage = '時間帯ごとの使い方が論点になる構造です。朝・昼・夕・夜の配分を見ると、判断の材料が増えます。';
    } else {
      insightMessage = '電力量料金が支配的な構造です。使用量単価の違い、つまりプラン選びが効いてくる領域です。';
    }

    // 表示更新
    resFacility.textContent = facilitySelect.value;
    resTotal.textContent = formatYen(totalCharge);
    resLoadRate.textContent = formatPercent(loadFactorPct);
    resLoadInline.textContent = formatPercent(loadFactorPct);

    resBasic.textContent = formatYen(basicCharge);
    resEnergy.textContent = formatYen(energyCharge);
    resRenewable.textContent = formatYen(renewableCharge);

    ratioBasic.textContent = formatPercent(basicPct);
    ratioEnergy.textContent = formatPercent(energyPct);
    ratioRenewable.textContent = formatPercent(renewablePct);

    barBasic.style.width = basicPct.toFixed(2) + '%';
    barEnergy.style.width = energyPct.toFixed(2) + '%';
    barRenewable.style.width = renewablePct.toFixed(2) + '%';

    resInsightText.textContent = insightMessage;

    resultEl.hidden = false;
  });
})();
