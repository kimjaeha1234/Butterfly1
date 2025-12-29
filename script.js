// ============================================
// 음료 데이터
// ============================================
const DRINKS = [
    { id: 'americano_short', name: '아메리카노 (Short)', caffeine: 75, volume: '236ml', type: '커피' },
    { id: 'americano_tall', name: '아메리카노 (Tall)', caffeine: 150, volume: '355ml', type: '커피' },
    { id: 'americano_grande', name: '아메리카노 (Grande)', caffeine: 225, volume: '473ml', type: '커피' },
    { id: 'americano_venti', name: '아메리카노 (Venti)', caffeine: 300, volume: '591ml', type: '커피' },
    { id: 'caffe_latte_tall', name: '카페라떼 (Tall)', caffeine: 75, volume: '355ml', type: '커피' },
    { id: 'caffe_latte_grande', name: '카페라떼 (Grande)', caffeine: 150, volume: '473ml', type: '커피' },
    { id: 'caffe_latte_venti', name: '카페라떼 (Venti)', caffeine: 300, volume: '591ml', type: '커피' },
    { id: 'espresso_shot', name: '에스프레소 샷', caffeine: 75, volume: '30ml', type: '커피' },
    { id: 'monster', name: '몬스터 에너지', caffeine: 77, volume: '250ml', type: '에너지 음료' },
    { id: 'redbull', name: '레드불', caffeine: 62.5, volume: '250ml', type: '에너지 음료' },
    { id: 'hotsix', name: '핫식스', caffeine: 60, volume: '250ml', type: '에너지 음료' },
];

// ============================================
// 전역 상태
// ============================================
let state = {
    currentStep: 'input',
    age: '',
    weight: '',
    selectedDrinks: {},
    searchQuery: '',
    result: null,
};

// ============================================
// DOM 요소
// ============================================
const ageInput = document.getElementById('age-input');
const weightInput = document.getElementById('weight-input');
const searchInput = document.getElementById('search-input');
const drinksContainer = document.getElementById('drinks-container');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const resetBtnSafe = document.getElementById('reset-btn-safe');
const caffeineSummary = document.getElementById('caffeine-summary');
const totalCaffeineSpan = document.getElementById('total-caffeine');
const recommendedLimitSpan = document.getElementById('recommended-limit');

// ============================================
// 초기화
// ============================================
function init() {
    renderDrinks();
    attachEventListeners();
}

// ============================================
// 이벤트 리스너 설정
// ============================================
function attachEventListeners() {
    // 나이, 체중 입력
    ageInput.addEventListener('input', (e) => {
        state.age = e.target.value;
        updateRecommendedLimit();
    });

    weightInput.addEventListener('input', (e) => {
        state.weight = e.target.value;
        updateRecommendedLimit();
    });

    // 검색
    searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderDrinks();
    });

    // 제출 버튼
    submitBtn.addEventListener('click', handleSubmit);

    // 리셋 버튼
    resetBtn.addEventListener('click', handleReset);
    resetBtnSafe.addEventListener('click', handleReset);

    // 네비게이션
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            navigateTo(page);
        });
    });
}

// ============================================
// 음료 렌더링
// ============================================
function renderDrinks() {
    const filteredDrinks = DRINKS.filter(drink =>
        drink.name.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    drinksContainer.innerHTML = filteredDrinks.map(drink => {
        const count = state.selectedDrinks[drink.id] || 0;
        return `
            <div class="drink-card">
                <div class="drink-info">
                    <div class="drink-name">${drink.name}</div>
                    <div class="drink-details">
                        <span>${drink.caffeine}mg</span>
                        <span>${drink.volume}</span>
                    </div>
                </div>
                <div class="drink-controls">
                    ${count > 0 ? `
                        <button class="btn-control minus" data-drink="${drink.id}" data-action="decrease">−</button>
                        <span class="drink-count">${count}</span>
                    ` : ''}
                    <button class="btn-control" data-drink="${drink.id}" data-action="increase">+</button>
                </div>
            </div>
        `;
    }).join('');

    // 음료 컨트롤 이벤트
    drinksContainer.querySelectorAll('.btn-control').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const drinkId = e.target.closest('button').dataset.drink;
            const action = e.target.closest('button').dataset.action;
            handleDrinkChange(drinkId, action === 'increase' ? 1 : -1);
        });
    });
}

// ============================================
// 음료 변경 처리
// ============================================
function handleDrinkChange(drinkId, delta) {
    const current = state.selectedDrinks[drinkId] || 0;
    const next = Math.max(0, current + delta);
    state.selectedDrinks[drinkId] = next;

    if (next === 0) {
        delete state.selectedDrinks[drinkId];
    }

    renderDrinks();
    updateCaffeineSummary();
    updateRecommendedLimit();
}

// ============================================
// 카페인 합계 계산
// ============================================
function calculateTotalCaffeine() {
    return DRINKS.reduce((acc, drink) => {
        return acc + (drink.caffeine * (state.selectedDrinks[drink.id] || 0));
    }, 0);
}

// ============================================
// 카페인 요약 업데이트
// ============================================
function updateCaffeineSummary() {
    const selectedItems = Object.entries(state.selectedDrinks)
        .filter(([_, count]) => count > 0)
        .map(([drinkId, count]) => {
            const drink = DRINKS.find(d => d.id === drinkId);
            return drink ? `
                <div class="caffeine-item">
                    <span class="caffeine-item-name">${drink.name} x ${count}</span>
                    <span class="caffeine-item-value">${drink.caffeine * count}mg</span>
                </div>
            ` : '';
        })
        .join('');

    caffeineSummary.innerHTML = selectedItems || '<p class="empty-message">선택한 음료가 없습니다.</p>';
}

// ============================================
// 권장 섭취량 업데이트
// ============================================
function updateRecommendedLimit() {
    const total = calculateTotalCaffeine();
    const limit = state.weight ? Math.round(parseInt(state.weight) * 2.5) : 0;

    totalCaffeineSpan.textContent = total;
    recommendedLimitSpan.textContent = limit;

    // 제출 버튼 표시/숨김
    if (total > 0) {
        submitBtn.style.display = 'flex';
    } else {
        submitBtn.style.display = 'none';
    }
}

// ============================================
// 제출 처리
// ============================================
function handleSubmit() {
    if (!state.age || !state.weight) {
        alert('나이와 몸무게를 입력해주세요.');
        return;
    }

    const totalCaffeine = calculateTotalCaffeine();
    const recommendedLimit = Math.round(parseInt(state.weight) * 2.5);
    let excessPercentage = 0;

    if (totalCaffeine > recommendedLimit) {
        excessPercentage = Math.round(((totalCaffeine - recommendedLimit) / recommendedLimit) * 100);
    }

    state.result = {
        totalCaffeine,
        recommendedLimit,
        excessPercentage,
        isSafe: totalCaffeine <= recommendedLimit,
    };

    state.currentStep = 'result';
    renderResult();
}

// ============================================
// 결과 렌더링
// ============================================
function renderResult() {
    const inputStep = document.getElementById('input-step');
    const resultStep = document.getElementById('result-step');

    inputStep.classList.remove('active');
    resultStep.classList.add('active');

    const { totalCaffeine, recommendedLimit, excessPercentage, isSafe } = state.result;

    // 상태 카드 업데이트
    const statusCard = document.getElementById('status-card');
    statusCard.className = 'status-card';
    
    if (isSafe) {
        statusCard.classList.add('safe');
        document.getElementById('status-title').textContent = '안전합니다!';
        document.getElementById('status-message').textContent = '지금처럼 건강한 습관을 유지해 보세요';
    } else if (excessPercentage < 20) {
        statusCard.classList.add('warning');
        document.getElementById('status-title').textContent = '조금 많아요';
        document.getElementById('status-message').textContent = '카페인 섭취를 조절할 필요가 있습니다';
    } else {
        statusCard.classList.add('danger');
        document.getElementById('status-title').textContent = '위험 수준입니다';
        document.getElementById('status-message').textContent = '카페인 섭취를 조절할 필요가 있습니다';
    }

    // 수치 업데이트
    document.getElementById('result-total').textContent = totalCaffeine;
    document.getElementById('result-recommended').textContent = recommendedLimit;

    // 분석 목록 업데이트
    const analysisList = document.getElementById('analysis-list');
    analysisList.className = 'analysis-list' + (isSafe ? '' : ' danger');
    const symptoms = isSafe
        ? ['집중력 향상 효과', '적절한 에너지 유지', '안정적인 수면 유도']
        : ['수면 부족 및 불면증', '불안 및 신경과민', '심박수 증가'];

    analysisList.innerHTML = symptoms.map(symptom => 
        `<li>${symptom}</li>`
    ).join('');

    // 조언 박스 표시/숨김
    const adviceBox = document.getElementById('advice-box');
    const safeActionBox = document.getElementById('safe-action-box');

    if (!isSafe) {
        adviceBox.style.display = 'block';
        safeActionBox.style.display = 'none';
    } else {
        adviceBox.style.display = 'none';
        safeActionBox.style.display = 'block';
    }

    // 차트 그리기
    drawCaffeineChart(totalCaffeine, recommendedLimit);
}

// ============================================
// 카페인 차트 그리기
// ============================================
function drawCaffeineChart(total, recommended) {
    const canvas = document.getElementById('caffeine-chart');
    const ctx = canvas.getContext('2d');

    // 캔버스 크기 설정
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 200;

    const padding = 60;
    const width = canvas.width - padding - 20;
    const height = canvas.height - padding - 20;

    // 배경
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 최대값 계산
    const maxValue = Math.max(total, recommended) * 1.2;
    const scale = height / maxValue;

    // 그리드
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (height * i / 4);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - 20, y);
        ctx.stroke();
    }

    // 바 그리기
    const barWidth = 40;
    const barGap = 60;
    const startX = padding + 30;

    // 권장량 바
    const recommendedHeight = recommended * scale;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(startX, padding + height - recommendedHeight, barWidth, recommendedHeight);

    // 섭취량 바
    const totalHeight = total * scale;
    const barColor = total <= recommended ? '#22c55e' : (total - recommended) / recommended < 0.2 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = barColor;
    ctx.fillRect(startX + barGap, padding + height - totalHeight, barWidth, totalHeight);

    // 축 레이블
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Arial';
    ctx.fontWeight = '600';
    ctx.textAlign = 'center';

    ctx.fillText('권장량', startX + barWidth / 2, canvas.height - 20);
    ctx.fillText('나의 섭취량', startX + barGap + barWidth / 2, canvas.height - 20);

    // Y축 레이블
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const value = Math.round((maxValue / 4) * i);
        const y = padding + (height * (4 - i) / 4);
        ctx.fillText(value + ' mg', padding - 10, y + 4);
    }
}

// ============================================
// 리셋 처리
// ============================================
function handleReset() {
    state = {
        currentStep: 'input',
        age: '',
        weight: '',
        selectedDrinks: {},
        searchQuery: '',
        result: null,
    };

    ageInput.value = '';
    weightInput.value = '';
    searchInput.value = '';

    const inputStep = document.getElementById('input-step');
    const resultStep = document.getElementById('result-step');

    resultStep.classList.remove('active');
    inputStep.classList.add('active');

    updateCaffeineSummary();
    updateRecommendedLimit();
    renderDrinks();
}

// ============================================
// 페이지 네비게이션
// ============================================
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}-page`).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
}

// ============================================
// 초기화 실행
// ============================================
document.addEventListener('DOMContentLoaded', init);
