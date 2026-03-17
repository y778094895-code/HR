
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MLServiceClient } from './ml.service.client';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'IMLServiceClient',
            useClass: MLServiceClient,
        },
        MLServiceClient // Also provide class directly if needed
    ],
    exports: ['IMLServiceClient', MLServiceClient],
})
export class MLServiceModule { }
