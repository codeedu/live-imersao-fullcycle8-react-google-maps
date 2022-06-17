import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ListAllRoutesUseCase } from '../@core/application/list-all-routes.use-case';
import { Route } from '../@core/domain/route.entity';

@WebSocketGateway({ cors: true })
export class RoutesGateway {
  constructor(private listAllUseCase: ListAllRoutesUseCase) {}

  @SubscribeMessage('get-directions')
  async handleNewDirectionsMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { routeId: string },
  ) {
    const routes = await this.listAllUseCase.execute();
    const route = routes.find((route) => data.routeId === route.id) as Route;
    for (const path of route.points) {
      client.emit('new-position', { routeId: data.routeId, path });
      await sleep(200);
    }
    client.emit('finished-route', { routeId: data.routeId });
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
