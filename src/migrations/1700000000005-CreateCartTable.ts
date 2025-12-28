import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCartTable1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cart',
        columns: [
          {
            name: 'cart_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'company_id',
            type: 'int',
          },
          {
            name: 'is_draft',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_bill_generated',
            type: 'boolean',
            default: true,
          },
           {
            name: 'is_deleted',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_by',
            type: 'int',
          },
          {
            name: 'updated_by',
            type: 'int',
          },
          {
            name: 'created_on',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_on',
            type: 'timestamp',
            isNullable: true,
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'cart',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['company_id'],
        referencedTableName: 'company',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('cart');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('company_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('cart', foreignKey);
    }
    await queryRunner.dropTable('cart');
  }
}

