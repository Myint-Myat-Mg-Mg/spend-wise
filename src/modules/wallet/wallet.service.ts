import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletService {

    async getAllWallet(): Promise<any> {
        const wallet = [
            {
                id: 1,
                userId: 1,
                walletName: "KPay"
            },
            {
                id: 2,
                userId: 2,
                walletname: "CB Pay"
            }
        ];

        return wallet;
    }
}
