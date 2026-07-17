const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target); 
    }
  });
}, { 
  threshold: 0,
  rootMargin: "0px 0px 0px 0px" 
});

const observer50 = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target); 
    }
  });
}, { 
  threshold: 0.3,
  rootMargin: "0px 0px 200px 0px" 
});

const observer50x = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target); 
    }
  });
}, { 
  threshold: 0.5,
  rootMargin: "0px 0px 0px 0px" 
});

const faqBlock:NodeListOf<Element> = document.querySelectorAll(".openFaq");
const hiddenBlock:NodeListOf<Element> = document.querySelectorAll(".hiddenBlock");
const cross:NodeListOf<Element> = document.querySelectorAll(".cross");

faqBlock.forEach((el, key)=>{
  el.addEventListener("click", ()=>{
    hiddenBlock[key].classList.toggle('active')
    cross[key].classList.toggle('active')
  })
})

const button = document.querySelector('#projectsBut');
const targetBlock = document.querySelector('#projects')

if(button){
  button!.addEventListener('click', (event) => {
  event.preventDefault();
  
  targetBlock!.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
});
}

const burgerMenu = document.getElementById("burger-menu");
const burgerMenuSection = document.getElementById("burgerMenuSection");
const mainSection = document.getElementById("mainSection");
const navMenu = document.querySelectorAll(".navMenu");

burgerMenu!.addEventListener('click', ()=>{
  if(burgerMenuSection){
    burgerMenuSection?.classList.toggle("active");
  }
  if(mainSection){
    mainSection?.classList.toggle("active");
  }
  if(burgerMenu){
    burgerMenu?.classList.toggle("is-open");
  }
})

navMenu.forEach(element => {
  element.addEventListener("click", ()=>{
    if(burgerMenuSection){
      burgerMenuSection?.classList.remove("active");
    }
    if(mainSection){
      mainSection?.classList.remove("active");
    }
    if(burgerMenu){
      burgerMenu?.classList.remove("is-open");
    }
  })
}, { capture: true });

// Получаем элементы из DOM с явным приведением типов
const selectBtn = document.getElementById('custom-select-btn') as HTMLButtonElement | null;
const dropdown = document.getElementById('custom-select-dropdown') as HTMLDivElement | null;
const selectedText = document.getElementById('selected-value') as HTMLSpanElement | null;
const hiddenInput = document.getElementById('select-hidden-input') as HTMLInputElement | null;

if (selectBtn && dropdown && selectedText && hiddenInput) {
  
  // 1. Обработчик клика по кнопке (Открыть / Закрыть)
  selectBtn.addEventListener('click', (e: MouseEvent): void => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });

  // 2. Делегирование клика для выбора элементов внутри списка
  dropdown.addEventListener('click', (e: MouseEvent): void => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const item = target.closest('.select-item') as HTMLButtonElement | null;

    if (item) {
      const value = item.getAttribute('data-value') || '';
      const text = item.textContent?.trim() || '';

      // Обновляем состояние главного элемента и скрытого инпута
      selectedText.textContent = text;
      hiddenInput.value = value;

      // Обновляем визуальный цвет текста: выбранный элемент становится черным, остальные серыми
      dropdown.querySelectorAll('.select-item').forEach((btn) => {
        const el = btn as HTMLButtonElement;
        if (el.getAttribute('data-value') === value) {
          el.classList.remove('text-[#868686]');
          el.classList.add('text-#0B0C10');
        } else {
          el.classList.remove('text-#0B0C10');
          el.classList.add('text-[#868686]');
        }
      });

      // Закрываем меню
      dropdown.classList.add('hidden');
    }
  });

  // 3. Закрытие меню при клике в любое другое место экрана
  document.addEventListener('click', (): void => {
    dropdown.classList.add('hidden');
  });
}

const number = document.getElementById("number") as HTMLInputElement;
const email = document.getElementById("email") as HTMLInputElement;
const name = document.getElementById("name") as HTMLInputElement;
const selectedValue = document.getElementById("selected-value") as HTMLElement;
const checkBox = document.getElementById("checkBox") as HTMLInputElement
const agreement = document.getElementById("agreement") as HTMLInputElement

// Описываем интерфейс для элементов массива, чтобы TypeScript не ругался
interface ValidationItem {
  name: HTMLInputElement;
  type: 'string' | 'number';
  requiredChar?: string;
}

// Задаем массив с правильными маркерами типов
const _elementsSendArray: ValidationItem[] = [
  { name: name, type: 'string' },
  { name: number, type: 'number' }, // Плюс убираем из запрещенных, число само по себе валидируется
  { name: email, type: 'string', requiredChar: '@' } // Меняем include на requiredChar
];

document.getElementById("butSend")?.addEventListener("click", (event) => {
    event.preventDefault(); 
    
    console.log('Клик по кнопке отправки');

    let hasAllFieldsValid = true;

    // проверяем чекбокс согласия
    if (!agreement || !agreement.checked) {
        if (checkBox) checkBox.style.borderColor = "red";
        console.log("checkBox не нажат");
        showToast("Согласитесь с политикой конфиденциальности", "error");
        return;
    } else if (checkBox) {
        checkBox.style.borderColor = "";
    }

    // Проверяем каждое поле
    for (let i = 0; i < _elementsSendArray.length; i++) {
        const item = _elementsSendArray[i];
        const input = item.name; 
        const value = input.value.trim();
        
        input.style.color = "#868686"; 
        input.style.borderColor = ""; 

        let isInvalid = false;

        if (!value) {
            isInvalid = true;
        }

        if (item.type === 'number' && isNaN(Number(value))) {
            isInvalid = true;
        }

        if (item.requiredChar && !value.includes(item.requiredChar)) {
            isInvalid = true;
        }

        // Красим поле при ошибке
        if (isInvalid) {
            console.log(`Ошибка в поле: ${input.id}`);
            input.style.color = "red";
            input.style.borderColor = "red"; 
            hasAllFieldsValid = false;
            showToast(`Корректно заполните ${input.id}`, "error");
        } else {
            console.log(`Поле ${input.id} успешно валидировано!`);
        }
    }

    if (hasAllFieldsValid) {
        console.log("Все поля заполнены верно. Подготовка к отправке на сервер...");

        const formData = {
          name: name.value,
          email: email.value,
          number: number.value,
          tarif: selectedValue.innerHTML
        };
        
        fetch('https://sintex.by', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showToast("Заявка успешно отправлена!", "success");

                // ОЧИСТКА ВСЕХ ПОЛЕЙ РАЗОМ
                for (let i = 0; i < _elementsSendArray.length; i++) {
                    _elementsSendArray[i].name.value = ''; 
                }
                if (agreement) agreement.checked = false;
                if (checkBox) checkBox.style.borderColor = ""; 
                
            } else {
                // Если бэкенд завернул невалидные данные
                showToast(`Ошибка валидации на сервере: ${data.message}`, "error");
            }
        })
        .catch(error => {
            console.error('Ошибка сети:', error);
            showToast(`Не удалось связаться с сервером.`, "error");
        });
        

        for (let i = 0; i < _elementsSendArray.length; i++) {
            const input = _elementsSendArray[i].name;
            input.value = ''; 
        }
        
        if (agreement) agreement.checked = false;
    }
});


function showToast(message:any, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // 1. Создаем элемент уведомления
    const toast = document.createElement('div');
    
    // Базовые стили под темный футуристичный дизайн Sintex
    toast.className = `
        pointer-events-auto
        bg-neutral-900/80 backdrop-blur-md
        text-white font-inter font-light tracking-wide
        px-6 py-3.5 rounded-sm
        shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]
        transform translate-x-full opacity-0
        transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
    `.trim().replace(/\s+/g, ' '); // Очищаем строку от лишних пробелов и переносов

    // 2. Добавляем индикаторы типа уведомления (белая или красная полоса слева)
    if (type === 'success') {
        toast.classList.add('border-l-4', 'border-white');
    } else {
        toast.classList.add('border-l-4', 'border-red-600');
    }

    // Вставляем текст
    toast.innerText = message;

    // 3. Рендерим в DOM
    container.appendChild(toast);

    // Запускаем анимацию появления (выезд справа)
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
        toast.classList.add('translate-x-0', 'opacity-100');
    }, 10);

    // 4. Запускаем таймер исчезновения через 4 секунды
    setTimeout(() => {
        // Возвращаем в исходное скрытое состояние
        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-full', 'opacity-0');
        
        // Полностью удаляем элемент из HTML после завершения анимации
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 4000);
}




document.querySelectorAll('.js-scroll-right50x').forEach(el => observer50x.observe(el));
document.querySelectorAll('.js-scroll-right50').forEach(el => observer50.observe(el));
document.querySelectorAll('.js-scroll-right20').forEach(el => observer.observe(el));
