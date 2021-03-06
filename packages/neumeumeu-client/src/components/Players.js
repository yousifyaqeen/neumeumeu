import React from "react";
import { pure } from "recompose";
import Player from "./Player";

const Players = ({
  players,
  canCancelCard,
  cancelCard,
  currentPlayerIndex = -1,
}) => (
  <ul className="players">
    {players.map((player, idx) => (
      <li className="players__item" key={player.id}>
        <Player
          player={player}
          cancelCard={cancelCard}
          canCancelCard={canCancelCard}
          isCurrentPlayer={idx === currentPlayerIndex}
          showMessage={players.length > 1}
          zone={idx + 1 > players.length / 2 ? "right" : "left"}
        />
      </li>
    ))}
  </ul>
);

export default pure(Players);
