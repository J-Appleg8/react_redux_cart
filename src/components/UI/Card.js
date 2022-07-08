import classes from './Card.module.css';

export default function Card(props) {
  return (
    <section className={`${classes.card} ${props.className ? props.className : ''}`}>
      {props.children}
    </section>
  );
}
