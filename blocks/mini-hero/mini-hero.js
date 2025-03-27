export default function decorate(block) {
  block.children[0].children[0].classList.add('background');
  block.children[0].children[1].classList.add('content');
}
