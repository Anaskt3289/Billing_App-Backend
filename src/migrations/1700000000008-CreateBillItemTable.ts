import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBillItemTable1700000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bill_item',
        columns: [
          {
            name: 'bill_item_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'bill_id',
            type: 'int',
          },
          {
            name: 'product_id',
            type: 'int',
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'unit_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'total_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'bill_item',
      new TableForeignKey({
        columnNames: ['bill_id'],
        referencedColumnNames: ['bill_id'],
        referencedTableName: 'bill',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'bill_item',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['product_id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('bill_item');
    const foreignKeys = table.foreignKeys;
    for (const foreignKey of foreignKeys) {
      await queryRunner.dropForeignKey('bill_item', foreignKey);
    }
    await queryRunner.dropTable('bill_item');
  }
}

