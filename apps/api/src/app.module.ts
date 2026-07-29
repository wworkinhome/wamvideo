import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { MoviesModule } from './movies/movies.module';
import { SeriesModule } from './series/series.module';
import { GenresModule } from './genres/genres.module';
import { ProfilesModule } from './profiles/profiles.module';
import { FavoritesModule } from './favorites/favorites.module';
import { WatchHistoryModule } from './watch-history/watch-history.module';
import { ChannelsModule } from './channels/channels.module';
import { EpgModule } from './epg/epg.module';
import { AccessModule } from './access/access.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AccessModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    MoviesModule,
    SeriesModule,
    GenresModule,
    ProfilesModule,
    FavoritesModule,
    WatchHistoryModule,
    ChannelsModule,
    EpgModule,
    PlansModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
