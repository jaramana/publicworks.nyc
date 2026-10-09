/* A journal entry: the masthead and the before-and-after sliders. Without
   this script a slider shows both pictures split down the middle. */
import './mast.ts';

document.querySelectorAll<HTMLInputElement>('.figure-slider input[type=range]').forEach(input => {
  const frame = input.closest<HTMLElement>('.slider-frame')!;
  const set = () => frame.style.setProperty('--pos', input.value + '%');
  input.addEventListener('input', set);
  set();
});
